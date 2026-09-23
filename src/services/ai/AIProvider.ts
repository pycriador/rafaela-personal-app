import { AIModelInfo } from '../../types';

export interface AIProviderCallResult {
  raw: string;
  structured: any;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

export interface AIProvider {
  testConnection(apiKey?: string): Promise<{ success: boolean; message: string; modelCount?: number }>;
  listModels(): Promise<AIModelInfo[]>;
  generateWorkoutProposal(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }): Promise<AIProviderCallResult>;
  reviewWorkout(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult>;
  suggestAlternatives(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult>;
  analyzeProgress(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult>;
}
