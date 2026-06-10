import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { AiService } from '../ai/ai.service';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { FilesService } from '../files/files.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateReviewDto } from './dto/create-review.dto';

const TEMPLATE_LABELS: Record<string, string> = {
  security: 'Security Review',
  performance: 'Performance Review',
  code_quality: 'Code Quality Review',
  documentation: 'Documentation Generator',
  architecture: 'Architecture Analysis',
};

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly aiService: AiService,
    private readonly aiProvidersService: AiProvidersService,
    private readonly filesService: FilesService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(userId: string, projectId: string, dto: CreateReviewDto) {
    const project = await this.projectsService.findOne(userId, projectId);
    const provider = await this.aiProvidersService.findDefault(userId);

    if (!provider) {
      throw new NotFoundException(
        'No AI provider configured. Add one in Settings.',
      );
    }

    const scope = dto.scope || (dto.targetFiles?.length ? 'multiple' : 'project');
    const targetDescription =
      scope === 'project'
        ? 'entire project'
        : scope === 'single'
          ? `file: ${dto.targetFiles?.[0]}`
          : `files: ${dto.targetFiles?.join(', ')}`;

    const codeContext = await this.filesService.buildCodeContext(
      userId,
      projectId,
      scope === 'project' ? undefined : dto.targetFiles,
    );

    const result = await this.aiService.reviewCode(
      provider,
      dto.template,
      codeContext,
      targetDescription,
    );

    const review = this.reviewRepository.create({
      projectId,
      title: `${TEMPLATE_LABELS[dto.template]} - ${project.name}`,
      template: dto.template,
      targetFiles: dto.targetFiles || [],
      summary: result.summary,
      issues: result.issues,
      recommendations: result.recommendations,
      rawResponse: result.rawResponse,
    });

    return this.reviewRepository.save(review);
  }

  async findAll(userId: string, projectId: string, search?: string) {
    await this.projectsService.findOne(userId, projectId);

    const where: Record<string, unknown> = { projectId };
    if (search) {
      return this.reviewRepository.find({
        where: [
          { projectId, title: ILike(`%${search}%`) },
          { projectId, summary: ILike(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return this.reviewRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, projectId: string, id: string) {
    await this.projectsService.findOne(userId, projectId);
    const review = await this.reviewRepository.findOne({
      where: { id, projectId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }
}
