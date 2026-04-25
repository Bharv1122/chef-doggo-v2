export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AssistantSession {
  id: string;
  dogProfileId?: string;
  messages: ChatMessage[];
  createdAt: string;
}

export type AssistantIntent =
  | 'food_question'
  | 'substitution'
  | 'calculation'
  | 'batch_scaling'
  | 'shopping'
  | 'supplement'
  | 'safety'
  | 'treat_idea'
  | 'cooking_help'
  | 'general';

export interface AssistantContext {
  dogName?: string;
  dogWeightLbs?: number;
  activeRecipeName?: string;
  recentMessages: ChatMessage[];
}
