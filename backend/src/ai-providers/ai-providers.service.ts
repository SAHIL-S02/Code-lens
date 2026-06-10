import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiProvider } from '../entities/ai-provider.entity';
import { CreateAiProviderDto } from './dto/create-ai-provider.dto';
import { UpdateAiProviderDto } from './dto/update-ai-provider.dto';

@Injectable()
export class AiProvidersService {
  constructor(
    @InjectRepository(AiProvider)
    private readonly providerRepository: Repository<AiProvider>,
  ) {}

  async create(userId: string, dto: CreateAiProviderDto) {
    if (dto.isDefault) {
      await this.clearDefault(userId);
    }
    const provider = this.providerRepository.create({ ...dto, userId });
    return this.providerRepository.save(provider);
  }

  async findAll(userId: string) {
    return this.providerRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findDefault(userId: string) {
    const defaultProvider = await this.providerRepository.findOne({
      where: { userId, isDefault: true },
    });
    if (defaultProvider) return defaultProvider;

    return this.providerRepository.findOne({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(userId: string, id: string) {
    const provider = await this.providerRepository.findOne({
      where: { id, userId },
    });
    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }
    return provider;
  }

  async update(userId: string, id: string, dto: UpdateAiProviderDto) {
    const provider = await this.findOne(userId, id);
    if (dto.isDefault) {
      await this.clearDefault(userId);
    }
    Object.assign(provider, dto);
    return this.providerRepository.save(provider);
  }

  async remove(userId: string, id: string) {
    const provider = await this.findOne(userId, id);
    await this.providerRepository.remove(provider);
    return { deleted: true };
  }

  private async clearDefault(userId: string) {
    await this.providerRepository.update({ userId }, { isDefault: false });
  }
}
