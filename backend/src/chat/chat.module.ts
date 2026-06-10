import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from '../entities/chat-session.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { AiModule } from '../ai/ai.module';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { FilesModule } from '../files/files.module';
import { ProjectsModule } from '../projects/projects.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    AiModule,
    AiProvidersModule,
    FilesModule,
    ProjectsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
