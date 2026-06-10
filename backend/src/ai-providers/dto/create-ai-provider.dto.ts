import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAiProviderDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  baseUrl: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsString()
  @MinLength(1)
  modelName: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
