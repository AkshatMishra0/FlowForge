import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('config')
  @ApiOperation({ 
    summary: 'Get AI model configuration',
    description: 'Returns the current AI model configuration including GPT-5.1-Codex-Max settings. Enabled for all clients.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuration retrieved successfully',
    schema: {
      example: {
        model: '5.1-codex-max',
        maxTokens: 8192,
        temperature: 0.7,
        features: ['code-generation', 'code-review', 'auto-completion', 'refactoring'],
        enabledForAll: true
      }
    }
  })
  getConfig() {
    return this.aiService.getModelConfig();
  }

  @Post('generate')
  @ApiOperation({ 
    summary: 'Generate code using GPT-5.1-Codex-Max',
    description: 'Generate code based on natural language prompt using GPT-5.1-Codex-Max. Available to all clients.'
  })
  @ApiResponse({ status: 200, description: 'Code generated successfully' })
  @ApiResponse({ status: 403, description: 'GPT-5.1-Codex-Max not enabled for client' })
  async generateCode(@Body() body: { prompt: string }, @Req() req: any) {
    const clientId = req.user?.id;
    return this.aiService.generateCode(body.prompt, clientId);
  }

  @Post('review')
  @ApiOperation({ 
    summary: 'Review code using GPT-5.1-Codex-Max',
    description: 'Review code quality and provide suggestions using GPT-5.1-Codex-Max. Available to all clients.'
  })
  @ApiResponse({ status: 200, description: 'Code reviewed successfully' })
  @ApiResponse({ status: 403, description: 'GPT-5.1-Codex-Max not enabled for client' })
  async reviewCode(@Body() body: { code: string }, @Req() req: any) {
    const clientId = req.user?.id;
    return this.aiService.reviewCode(body.code, clientId);
  }

  @Post('autocomplete')
  @ApiOperation({ 
    summary: 'Auto-complete code using GPT-5.1-Codex-Max',
    description: 'Provide intelligent code completion suggestions. Available to all clients.'
  })
  @ApiResponse({ status: 200, description: 'Auto-completion suggestions generated' })
  async autoComplete(@Body() body: { code: string; cursor: number }, @Req() req: any) {
    const clientId = req.user?.id;
    return this.aiService.autoComplete(body.code, body.cursor, clientId);
  }

  @Post('refactor')
  @ApiOperation({ 
    summary: 'Refactor code using GPT-5.1-Codex-Max',
    description: 'Refactor code based on specific instructions. Available to all clients.'
  })
  @ApiResponse({ status: 200, description: 'Code refactored successfully' })
  async refactorCode(@Body() body: { code: string; instruction: string }, @Req() req: any) {
    const clientId = req.user?.id;
    return this.aiService.refactorCode(body.code, body.instruction, clientId);
  }
}
