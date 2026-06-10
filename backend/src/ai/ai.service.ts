import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { AiProvider } from '../entities/ai-provider.entity';
import { ReviewIssue, ReviewTemplate } from '../entities/review.entity';

export interface AiReviewResult {
  summary: string;
  issues: ReviewIssue[];
  recommendations: string[];
  rawResponse: string;
}

const TEMPLATE_PROMPTS: Record<ReviewTemplate, string> = {
  security: `Perform a Security Review. Focus on:
- Hardcoded credentials and secrets
- Authentication and authorization flaws
- Input validation gaps
- Injection risks (SQL, XSS, command injection)
- Insecure dependencies or configurations`,

  performance: `Perform a Performance Review. Focus on:
- Slow operations and blocking calls
- Inefficient rendering or re-renders
- Unnecessary database queries or N+1 patterns
- Memory leaks and resource management
- Caching opportunities`,

  code_quality: `Perform a Code Quality Review. Focus on:
- Naming conventions and clarity
- Code structure and modularity
- Readability and maintainability
- DRY violations and duplication
- Error handling patterns`,

  documentation: `Generate project documentation including:
- README with project overview
- Setup and installation guide
- API documentation where applicable
Format as structured markdown sections.`,

  architecture: `Perform Architecture Analysis. Provide:
- High-level system overview
- Component/module breakdown
- Data flow description
- Technology stack identification
- Architectural strengths and concerns`,
};

@Injectable()
export class AiService {
  async chat(
    provider: AiProvider,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const baseUrl = provider.baseUrl.replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;

    try {
      const response = await axios.post(
        url,
        {
          model: provider.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(provider.apiKey
              ? { Authorization: `Bearer ${provider.apiKey}` }
              : {}),
          },
          timeout: 120000,
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Empty response from AI provider');
      }
      return content;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message || error.message
        : 'AI request failed';
      throw new BadRequestException(`AI provider error: ${message}`);
    }
  }

  async reviewCode(
    provider: AiProvider,
    template: ReviewTemplate,
    codeContext: string,
    targetDescription: string,
  ): Promise<AiReviewResult> {
    const systemPrompt = `You are an expert code reviewer. ${TEMPLATE_PROMPTS[template]}

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "High-level overview string",
  "issues": [
    {
      "title": "Issue title",
      "description": "Detailed description",
      "severity": "critical|high|medium|low",
      "file": "optional/file/path",
      "line": 0
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const userPrompt = `Review the following code for: ${targetDescription}

${codeContext}`;

    const rawResponse = await this.chat(provider, systemPrompt, userPrompt);
    return this.parseReviewResponse(rawResponse);
  }

  private parseReviewResponse(rawResponse: string): AiReviewResult {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        summary: rawResponse.slice(0, 500),
        issues: [],
        recommendations: [],
        rawResponse,
      };
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<AiReviewResult>;
      return {
        summary: parsed.summary || 'Review completed',
        issues: (parsed.issues || []).map((issue) => ({
          title: issue.title || 'Untitled issue',
          description: issue.description || '',
          severity: this.normalizeSeverity(issue.severity),
          file: issue.file,
          line: issue.line,
        })),
        recommendations: parsed.recommendations || [],
        rawResponse,
      };
    } catch {
      return {
        summary: 'Review completed with unstructured response',
        issues: [],
        recommendations: [],
        rawResponse,
      };
    }
  }

  private normalizeSeverity(
    severity?: string,
  ): 'critical' | 'high' | 'medium' | 'low' {
    const normalized = severity?.toLowerCase();
    if (
      normalized === 'critical' ||
      normalized === 'high' ||
      normalized === 'medium' ||
      normalized === 'low'
    ) {
      return normalized;
    }
    return 'medium';
  }
}
