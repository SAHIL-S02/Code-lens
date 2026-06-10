import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Req() req: { user: User }, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: { user: User }) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: { user: User }, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.id, id);
  }

  @Delete(':id')
  remove(@Req() req: { user: User }, @Param('id') id: string) {
    return this.projectsService.remove(req.user.id, id);
  }
}
