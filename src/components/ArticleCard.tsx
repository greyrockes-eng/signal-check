'use client';

import Link from 'next/link';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import BiasMeter from './BiasMeter';
import type { Article } from '@/lib/supabase';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getScoreColor(score: number) {
  if (score >= 8) return 'text-emerald-400';
  if (score >= 6) return 'text-blue-400';
  if (score >= 4) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number) {
  if (score >= 8) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score >= 6) return 'bg-blue-500/10 border-blue-500/20';
  if (score >= 4) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const topicName = article.topics?.name || 'General';
  const topicIcon = article.topics?.icon || '📰';

  return (
    <Link href={`/article/${article.slug}`}>
      <div
        className={`article-card rounded-xl border border-[#1e2540] bg-[#151929] overflow-hidden cursor-pointer ${
          featured ? 'col-span-full lg:flex' : ''
        }`}
      >
        {/* Image */}
        {article.image_url && (
          <div
            className={`relative overflow-hidden ${
              featured ? 'lg:w-1/2 h-48 lg:h-auto' : 'h-40'
            }`}
          >
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-sm text-white">
                {topicIcon} {topicName}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`p-5 ${featured ? 'lg:w-1/2 lg:p-8 flex flex-col justify-center' : ''}`}>
          <h3
            className={`font-bold text-white leading-snug mb-2 ${
              featured ? 'text-2xl' : 'text-base'
            }`}
          >
            {article.title}
          </h3>

          <p className={`text-gray-400 mb-4 leading-relaxed ${featured ? 'text-sm' : 'text-xs line-clamp-2'}`}>
            {article.summary}
          </p>

          {/* Metrics row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Fact Check Score */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getScoreBg(
                article.fact_check_score
              )}`}
            >
              {article.fact_check_score >= 7 ? (
                <CheckCircle size={12} className={getScoreColor(article.fact_check_score)} />
              ) : (
                <AlertTriangle size={12} className={getScoreColor(article.fact_check_score)} />
              )}
              <span className={getScoreColor(article.fact_check_score)}>
                {article.fact_check_score.toFixed(1)}
              </span>
            </div>

            {/* Bias meter mini */}
            <div className="w-24">
              <BiasMeter bias={article.overall_bias} compact />
            </div>

            {/* Claims */}
            <span className="text-[11px] text-gray-500">
              {article.verified_claim_count}/{article.claim_count} claims verified
            </span>

            {/* Time */}
            <span className="text-[11px] text-gray-500 flex items-center gap-1 ml-auto">
              <Clock size={10} />
              {timeAgo(article.published_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
