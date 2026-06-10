import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { FilesModule } from './files/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AiProvidersModule } from './ai-providers/ai-providers.module';
import { ChatModule } from './chat/chat.module';
import { User } from './entities/user.entity';
import { Project } from './entities/project.entity';
import { FileEntity } from './entities/file.entity';
import { Review } from './entities/review.entity';
import { AiProvider } from './entities/ai-provider.entity';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'codelens'),
        password: config.get('DB_PASSWORD', 'codelens'),
        database: config.get('DB_NAME', 'codelens'),
        entities: [
          User,
          Project,
          FileEntity,
          Review,
          AiProvider,
          ChatSession,
          ChatMessage,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    ProjectsModule,
    FilesModule,
    ReviewsModule,
    AiProvidersModule,
    ChatModule,
  ],
})
export class AppModule {}
