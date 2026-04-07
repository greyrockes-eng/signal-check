import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Topic {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  logo_url: string | null;
  bias_rating: number;
  reliability_score: number;
  description: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string | null;
  fact_check_score: number;
  overall_bias: number;
  claim_count: number;
  verified_claim_count: number;
  topic_id: string;
  published_at: string;
  topics?: Topic;
}

export interface SourceReport {
  id: string;
  article_id: string;
  source_id: string;
  original_title: string;
  original_url: string;
  source_bias_on_story: number;
  key_claims: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sources?: Source;
}

export interface Claim {
  id: string;
  article_id: string;
  claim_text: string;
  verdict: 'true' | 'mostly_true' | 'half_true' | 'mostly_false' | 'false' | 'unverifiable';
  evidence: string;
  source_count: number;
}
