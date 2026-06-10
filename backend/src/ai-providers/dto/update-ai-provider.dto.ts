import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAiProviderDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  modelName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
