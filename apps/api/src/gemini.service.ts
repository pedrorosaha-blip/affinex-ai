import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    
    // Passa a chave diretamente para o SDK moderno
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      return response.text || 'Sem resposta gerada.';
    } catch (error) {
      console.error('Erro detalhado no GeminiService:', error);
      throw new Error('Falha ao comunicar com a IA do Gemini.');
    }
  }
}