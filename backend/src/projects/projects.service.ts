import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const project = this.projectRepository.create({
      ...dto,
      userId,
    });
    return this.projectRepository.save(project);
  }

  async findAll(userId: string) {
    return this.projectRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: { files: true },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.projectRepository.findOne({
      where: { id, userId },
      relations: { files: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async remove(userId: string, id: string) {
    const project = await this.findOne(userId, id);
    await this.projectRepository.remove(project);
    return { deleted: true };
  }
}
