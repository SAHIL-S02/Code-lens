import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { AiService } from '../ai/ai.service';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { FilesService } from '../files/files.service';
import { ProjectsService } from '../projects/projects.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    private readonly aiService: AiService,
    private readonly aiProvidersService: AiProvidersService,
    private readonly filesService: FilesService,
    private readonly projectsService: ProjectsService,
  ) {}

  async sendMessage(
    userId: string,
    projectId: string,
    dto: SendMessageDto,
  ) {
    await this.projectsService.findOne(userId, projectId);
    const provider = await this.aiProvidersService.findDefault(userId);

    if (!provider) {
      throw new NotFoundException(
        'No AI provider configured. Add one in Settings.',
      );
    }

    let session: ChatSession;
    if (dto.sessionId) {
      const existing = await this.sessionRepository.findOne({
        where: { id: dto.sessionId, projectId },
        relations: { messages: true },
      });
      if (!existing) {
        throw new NotFoundException('Chat session not found');
      }
      session = existing;
    } else {
      session = this.sessionRepository.create({
        projectId,
        title: dto.message.slice(0, 50),
      });
      session = await this.sessionRepository.save(session);
      session.messages = [];
    }

    const userMessage = this.messageRepository.create({
      sessionId: session.id,
      role: 'user',
      content: dto.message,
    });
    await this.messageRepository.save(userMessage);

    const codeContext = await this.filesService.buildCodeContext(
      userId,
      projectId,
      undefined,
      50000,
    );

    const history = (session.messages || [])
      .slice(-6)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are a helpful code assistant. Answer questions about the uploaded project code.
Use the provided code context to give accurate, specific answers.
If you reference a file, mention its path.`;

    const userPrompt = `Code Context:
${codeContext}

${history ? `Previous conversation:\n${history}\n\n` : ''}User question: ${dto.message}`;

    const assistantContent = await this.aiService.chat(
      provider,
      systemPrompt,
      userPrompt,
    );

    const assistantMessage = this.messageRepository.create({
      sessionId: session.id,
      role: 'assistant',
      content: assistantContent,
    });
    await this.messageRepository.save(assistantMessage);

    return {
      sessionId: session.id,
      messages: [userMessage, assistantMessage],
    };
  }

  async getSessions(userId: string, projectId: string) {
    await this.projectsService.findOne(userId, projectId);
    return this.sessionRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSession(userId: string, projectId: string, sessionId: string) {
    await this.projectsService.findOne(userId, projectId);
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, projectId },
      relations: { messages: true },
    });
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    session.messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    return session;
  }
}
