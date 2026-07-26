import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate')
  async generateGemini(
    @Body('prompt') prompt: string,
    @Body('systemInstruction') systemInstruction?: string,
  ) {
    if (!prompt) {
      return { error: 'O campo "prompt" é obrigatório.' };
    }

    const response = await this.geminiService.generateText(prompt, systemInstruction);
    return { response };
  }
}