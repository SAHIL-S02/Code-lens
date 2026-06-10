import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { FilesService } from './files.service';

@Controller('projects/:projectId/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/zip')
  @UseInterceptors(FileInterceptor('file'))
  uploadZip(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.filesService.uploadZip(req.user.id, projectId, file.buffer);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 200))
  uploadFiles(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('paths') pathsRaw?: string,
  ) {
    const paths = pathsRaw ? JSON.parse(pathsRaw) : undefined;
    return this.filesService.uploadFiles(
      req.user.id,
      projectId,
      files,
      paths,
    );
  }

  @Post('import/github')
  importGithub(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @Body('repoUrl') repoUrl: string,
  ) {
    return this.filesService.importFromGithub(
      req.user.id,
      projectId,
      repoUrl,
    );
  }

  @Get('tree')
  getTree(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
  ) {
    return this.filesService.getFileTree(req.user.id, projectId);
  }

  @Get('content')
  getContent(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @Query('path') path: string,
  ) {
    return this.filesService.getFileContent(req.user.id, projectId, path);
  }
}
