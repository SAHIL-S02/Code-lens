import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { AiModule } from '../ai/ai.module';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { FilesModule } from '../files/files.module';
import { ProjectsModule } from '../projects/projects.module';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    AiModule,
    AiProvidersModule,
    FilesModule,
    ProjectsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
