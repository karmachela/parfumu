
export interface Perfume {
  id: number;
  name: string;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  inspiration: string | null;
  price: string;
  shopee_url: string;
  tokopedia_url: string;
  scent_family: string[];
}

export type ViewMode = 'quiz' | 'collection' | 'result' | 'about';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface QuizAnswers {
  [key: number]: string;
}

export interface QuizOption {
  text: string;
  tag: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}
