import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiProvider } from '../entities/ai-provider.entity';
import { AiProvidersService } from './ai-providers.service';
import { AiProvidersController } from './ai-providers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiProvider])],
  controllers: [AiProvidersController],
  providers: [AiProvidersService],
  exports: [AiProvidersService],
})
export class AiProvidersModule {}
