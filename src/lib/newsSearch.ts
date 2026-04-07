// Client helper for the news-search edge function

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/news-search`;

export interface GradedArticle {
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  source_name: string;
  published_at: string;
  signal_score: number;
  reliability_score: number;
  bias_rating: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface NewsSearchResponse {
  success: boolean;
  mode: 'topic' | 'country-headlines' | 'country-search' | 'category-headlines' | 'top-headlines';
  query: {
    topic: string | null;
    country: string | null;
    countryName: string | null;
    category: string | null;
  };
  count: number;
  avg_signal_score: number;
  avg_bias: number;
  articles: GradedArticle[];
}

export async function searchNews(params: {
  topic?: string;
  country?: string;
  countryName?: string;
  category?: string;
}): Promise<NewsSearchResponse> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`news-search failed: ${res.status} ${text}`);
  }

  return res.json();
}
