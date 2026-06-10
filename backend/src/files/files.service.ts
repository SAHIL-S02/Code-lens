import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { FileEntity } from '../entities/file.entity';
import { ProjectsService } from '../projects/projects.service';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB per file
const MAX_TOTAL_FILES = 500;
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '__pycache__',
  '.venv',
  'venv',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs',
  '.cs', '.cpp', '.c', '.h', '.hpp', '.rb', '.php', '.swift',
  '.kt', '.scala', '.sql', '.html', '.css', '.scss', '.json',
  '.yaml', '.yml', '.xml', '.md', '.txt', '.env.example',
  '.sh', '.bash', '.dockerfile', '.toml', '.ini', '.cfg',
  '.vue', '.svelte', '.prisma', '.graphql',
]);

export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly projectsService: ProjectsService,
  ) {}

  async uploadZip(userId: string, projectId: string, buffer: Buffer) {
    await this.projectsService.findOne(userId, projectId);
    await this.clearProjectFiles(projectId);

    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    let fileCount = 0;

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      if (this.shouldSkipPath(entry.entryName)) continue;
      if (!this.isTextFile(entry.entryName)) continue;
      if (fileCount >= MAX_TOTAL_FILES) break;

      const content = entry.getData().toString('utf8');
      if (content.length > MAX_FILE_SIZE) continue;

      await this.saveFile(projectId, entry.entryName, content);
      fileCount++;
    }

    return { uploaded: fileCount };
  }

  async uploadFiles(
    userId: string,
    projectId: string,
    files: Express.Multer.File[],
    paths?: string[],
  ) {
    await this.projectsService.findOne(userId, projectId);

    let fileCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = paths?.[i] || file.originalname;
      if (this.shouldSkipPath(relativePath)) continue;
      if (!this.isTextFile(relativePath)) continue;
      if (fileCount >= MAX_TOTAL_FILES) break;

      const content = file.buffer.toString('utf8');
      if (content.length > MAX_FILE_SIZE) continue;

      await this.saveFile(projectId, relativePath.replace(/\\/g, '/'), content);
      fileCount++;
    }

    return { uploaded: fileCount };
  }

  async importFromGithub(
    userId: string,
    projectId: string,
    repoUrl: string,
  ) {
    await this.projectsService.findOne(userId, projectId);
    await this.clearProjectFiles(projectId);

    const match = repoUrl.match(
      /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/,
    );
    if (!match) {
      throw new BadRequestException('Invalid GitHub repository URL');
    }

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

    let treeResponse;
    try {
      treeResponse = await axios.get(apiUrl, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 30000,
      });
    } catch {
      const masterUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
      treeResponse = await axios.get(masterUrl, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 30000,
      });
    }

    const tree = treeResponse.data.tree as Array<{
      path: string;
      type: string;
      url: string;
    }>;

    let fileCount = 0;
    for (const item of tree) {
      if (item.type !== 'blob') continue;
      if (this.shouldSkipPath(item.path)) continue;
      if (!this.isTextFile(item.path)) continue;
      if (fileCount >= MAX_TOTAL_FILES) break;

      try {
        const blobResponse = await axios.get(item.url, {
          headers: { Accept: 'application/vnd.github.v3+json' },
          timeout: 10000,
        });
        const content = Buffer.from(
          blobResponse.data.content,
          'base64',
        ).toString('utf8');
        if (content.length > MAX_FILE_SIZE) continue;

        await this.saveFile(projectId, item.path, content);
        fileCount++;
      } catch {
        continue;
      }
    }

    if (fileCount === 0) {
      throw new BadRequestException(
        'No readable files found in repository. It may be private or empty.',
      );
    }

    return { uploaded: fileCount };
  }

  async getFileTree(userId: string, projectId: string): Promise<FileTreeNode[]> {
    await this.projectsService.findOne(userId, projectId);
    const files = await this.fileRepository.find({
      where: { projectId },
      order: { path: 'ASC' },
    });

    const root: FileTreeNode[] = [];
    const nodeMap = new Map<string, FileTreeNode>();

    for (const file of files) {
      const parts = file.path.split('/');
      let currentPath = '';
      let currentLevel = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = i === parts.length - 1;

        if (!nodeMap.has(currentPath)) {
          const node: FileTreeNode = {
            name: part,
            path: currentPath,
            isDirectory: !isLast,
            children: !isLast ? [] : undefined,
          };
          nodeMap.set(currentPath, node);
          currentLevel.push(node);
        }

        if (!isLast) {
          const node = nodeMap.get(currentPath)!;
          if (!node.children) node.children = [];
          currentLevel = node.children;
        }
      }
    }

    return root;
  }

  async getFileContent(userId: string, projectId: string, filePath: string) {
    await this.projectsService.findOne(userId, projectId);
    const file = await this.fileRepository.findOne({
      where: { projectId, path: filePath },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async getProjectFiles(userId: string, projectId: string, paths?: string[]) {
    await this.projectsService.findOne(userId, projectId);
    const query = this.fileRepository
      .createQueryBuilder('file')
      .where('file.projectId = :projectId', { projectId });

    if (paths?.length) {
      query.andWhere('file.path IN (:...paths)', { paths });
    }

    return query.orderBy('file.path', 'ASC').getMany();
  }

  async buildCodeContext(
    userId: string,
    projectId: string,
    paths?: string[],
    maxChars = 80000,
  ): Promise<string> {
    const files = await this.getProjectFiles(userId, projectId, paths);
    let context = '';
    for (const file of files) {
      const block = `\n--- FILE: ${file.path} ---\n${file.content}\n`;
      if (context.length + block.length > maxChars) break;
      context += block;
    }
    if (!context) {
      throw new BadRequestException('No code files available for review');
    }
    return context;
  }

  private async saveFile(
    projectId: string,
    path: string,
    content: string,
  ) {
    const normalizedPath = path.replace(/\\/g, '/').replace(/^\.\//, '');
    const name = normalizedPath.split('/').pop() || normalizedPath;
    const parentPath = normalizedPath.includes('/')
      ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
      : undefined;

    const existing = await this.fileRepository.findOne({
      where: { projectId, path: normalizedPath },
    });

    if (existing) {
      existing.content = content;
      existing.size = content.length;
      await this.fileRepository.save(existing);
    } else {
      const file = this.fileRepository.create({
        projectId,
        path: normalizedPath,
        name,
        parentPath,
        isDirectory: false,
        content,
        mimeType: 'text/plain',
        size: content.length,
      });
      await this.fileRepository.save(file);
    }
  }

  private async clearProjectFiles(projectId: string) {
    await this.fileRepository.delete({ projectId });
  }

  private shouldSkipPath(filePath: string): boolean {
    const parts = filePath.split(/[/\\]/);
    return parts.some((part) => SKIP_DIRS.has(part) || part.startsWith('.'));
  }

  private isTextFile(filePath: string): boolean {
    const ext = filePath.includes('.')
      ? '.' + filePath.split('.').pop()!.toLowerCase()
      : '';
    if (TEXT_EXTENSIONS.has(ext)) return true;
    const basename = filePath.split('/').pop()?.toLowerCase() || '';
    return ['dockerfile', 'makefile', 'license', 'readme'].some((n) =>
      basename.startsWith(n),
    );
  }
}
