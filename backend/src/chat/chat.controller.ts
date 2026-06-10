import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('projects/:projectId/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  sendMessage(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.id, projectId, dto);
  }

  @Get('sessions')
  getSessions(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
  ) {
    return this.chatService.getSessions(req.user.id, projectId);
  }

  @Get('sessions/:sessionId')
  getSession(
    @Req() req: { user: User },
    @Param('projectId') projectId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.chatService.getSession(req.user.id, projectId, sessionId);
  }
}
