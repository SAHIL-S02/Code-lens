import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { AiProvidersService } from './ai-providers.service';
import { CreateAiProviderDto } from './dto/create-ai-provider.dto';
import { UpdateAiProviderDto } from './dto/update-ai-provider.dto';

@Controller('ai-providers')
@UseGuards(JwtAuthGuard)
export class AiProvidersController {
  constructor(private readonly aiProvidersService: AiProvidersService) {}

  @Post()
  create(@Req() req: { user: User }, @Body() dto: CreateAiProviderDto) {
    return this.aiProvidersService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: { user: User }) {
    return this.aiProvidersService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: { user: User }, @Param('id') id: string) {
    return this.aiProvidersService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body() dto: UpdateAiProviderDto,
  ) {
    return this.aiProvidersService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: { user: User }, @Param('id') id: string) {
    return this.aiProvidersService.remove(req.user.id, id);
  }
}
