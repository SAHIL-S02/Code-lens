import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsEnum([
    'security',
    'performance',
    'code_quality',
    'documentation',
    'architecture',
  ])
  template:
    | 'security'
    | 'performance'
    | 'code_quality'
    | 'documentation'
    | 'architecture';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetFiles?: string[];

  @IsOptional()
  @IsString()
  scope?: 'single' | 'multiple' | 'project';
}
