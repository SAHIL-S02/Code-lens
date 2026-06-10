import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('projects/:projectId/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.id, projectId, dto);
  }

  @Get()
  findAll(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @Query('search') search?: string,
  ) {
    return this.reviewsService.findAll(req.user.id, projectId, search);
  }

  @Get(':id')
  findOne(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.reviewsService.findOne(req.user.id, projectId, id);
  }
}
