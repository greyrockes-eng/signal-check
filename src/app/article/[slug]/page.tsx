'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Article, SourceReport, Claim } from '@/lib/supabase';
import ScoreRing from '@/components/ScoreRing';
import BiasMeter from '@/components/BiasMeter';
import VerdictBadge from '@/components/VerdictBadge';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  Newspaper,
  Scale,
} from 'lucide-react';

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case 'positive': return 'text-emerald-400 bg-emerald-500/10';
    case 'negative': return 'text-red-400 bg-red-500/10';
    case 'mixed': return 'text-amber-400 bg-amber-500/10';
    default: return 'text-gray-400 bg-gray-500/10';
  }
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [sourceReports, setSourceReports] = useState<SourceReport[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);

      const { data: articleData } = await supabase
        .from('articles')
        .select('*, topics(*)')
        .eq('slug', slug)
        .single();

      if (articleData) {
        setArticle(articleData);

        // Fetch source reports and claims in parallel
        const [reportsRes, claimsRes] = await Promise.all([
          supabase
            .from('source_reports')
            .select('*, sources(*)')
            .eq('article_id', articleData.id),
          supabase
            .from('claims')
            .select('*')
            .eq('article_id', articleData.id),
        ]);

        if (reportsRes.data) setSourceReports(reportsRes.data);
        if (claimsRes.data) setClaims(claimsRes.data);
      }

      setLoading(false);
    }

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#151929] rounded w-3/4" />
          <div className="h-64 bg-[#151929] rounded-xl" />
          <div className="h-4 bg-[#151929] rounded w-full" />
          <div className="h-4 bg-[#151929] rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg">Article not found.</p>
        <Link href="/" className="text-blue-400 text-sm mt-4 inline-block">
          Back to feed
        </Link>
      </div>
    );
  }

  const topicName = article.topics?.name || 'General';
  const topicIcon = article.topics?.icon || '📰';
  const verifiedPercent = article.claim_count > 0
    ? Math.round((article.verified_claim_count / article.claim_count) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      {/* Back nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to feed
      </Link>

      {/* Hero image */}
      {article.image_url && (
        <div className="rounded-xl overflow-hidden mb-6 h-64 sm:h-80">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Topic & time */}
      <div className="flex items-center gap-3 mb-3">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {topicIcon} {topicName}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={12} />
          {timeAgo(article.published_at)}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white leading-tight mb-4">
        {article.title}
      </h1>

      {/* Trust dashboard */}
      <div className="grid grid-cols-3 gap-4 p-5 rounded-xl border border-[#1e2540] bg-[#151929] mb-8">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <ScoreRing score={article.fact_check_score} size={72} label="Trust Score" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-full max-w-[180px]">
            <BiasMeter bias={article.overall_bias} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{verifiedPercent}%</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Claims Verified</div>
          </div>
          <div className="text-xs text-gray-500">
            {article.verified_claim_count} of {article.claim_count} claims
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} className="text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Balanced Summary</h2>
          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">AI Generated</span>
        </div>
        <p className="text-gray-300 leading-relaxed">{article.summary}</p>
        {article.content && (
          <p className="text-gray-400 leading-relaxed mt-3 text-sm">{article.content}</p>
        )}
      </div>

      {/* Source Comparison */}
      {sourceReports.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper size={16} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">How Sources Covered This</h2>
          </div>
          <div className="space-y-3">
            {sourceReports.map((report) => {
              const source = report.sources;
              return (
                <div
                  key={report.id}
                  className="rounded-lg border border-[#1e2540] bg-[#151929] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-medium text-white text-sm">
                          {source?.name || 'Unknown Source'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getSentimentColor(report.sentiment)}`}>
                          {report.sentiment}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        &ldquo;{report.original_title}&rdquo;
                      </p>
                      <div className="w-40">
                        <BiasMeter bias={report.source_bias_on_story} compact />
                      </div>
                    </div>
                    <a
                      href={report.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <ExternalLink size={14} className="text-gray-500" />
                    </a>
                  </div>
                  {report.key_claims && Array.isArray(report.key_claims) && (
                    <div className="mt-3 pt-3 border-t border-[#1e2540]">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Key claims from this source:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {report.key_claims.map((claim: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs text-gray-400 bg-[#0c0f1a] px-2.5 py-1 rounded-full"
                          >
                            {claim}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fact Check Claims */}
      {claims.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Fact Check: Individual Claims</h2>
          </div>
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-lg border border-[#1e2540] bg-[#151929] p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm text-white font-medium flex-1">
                    &ldquo;{claim.claim_text}&rdquo;
                  </p>
                  <VerdictBadge verdict={claim.verdict} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{claim.evidence}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                  {claim.source_count >= 4 ? (
                    <CheckCircle size={10} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={10} className="text-amber-400" />
                  )}
                  Corroborated by {claim.source_count} source{claim.source_count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Literacy Note */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
        <h3 className="text-sm font-semibold text-purple-300 mb-2">About This Analysis</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Signal Check uses AI to aggregate and cross-reference multiple news sources for each story.
          Fact-check scores reflect how well key claims are supported across independent sources.
          Bias ratings are based on language analysis and framing comparison. Always read primary sources
          and form your own informed opinion.
        </p>
      </div>
    </div>
  );
}
