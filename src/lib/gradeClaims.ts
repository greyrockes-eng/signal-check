// Client helper for the grade-claims edge function. Given a lead article and
// the other articles covering the same story, returns extracted claims with
// cross-source confirmation counts. Cached server-side per article URL.

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/grade-claims`;

export interface GradedClaim {
  claim_text: string;
  claim_type: 'factual' | 'opinion';
  confirmation_count: number;
  confirming_sources: string[];
  total_cluster_sources: number;
}

export interface GradeClaimsResponse {
  success: boolean;
  cached: boolean;
  claims: GradedClaim[];
  error?: string;
}

export interface ClusterSource {
  source_name: string;
  title: string;
  description: string;
}

export async function gradeClaims(params: {
  lead: ClusterSource & { url: string };
  others: ClusterSource[];
}): Promise<GradeClaimsResponse> {
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
    throw new Error(`grade-claims failed: ${res.status} ${text}`);
  }

  return res.json();
}
