'use client';

import { useState, FormEvent } from 'react';
import { Search, Globe2, Loader2, ExternalLink } from 'lucide-react';
import ExploreGlobe from '@/components/ExploreGlobe';
import SignalScoreBadge from '@/components/SignalScoreBadge';
import { searchNews, GradedArticle, NewsSearchResponse } from '@/lib/newsSearch';

export default function ExplorePage() {
  const [topic, setTopic] = useState('');
  const [selectedIso2, setSelectedIso2] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [results, setResults] = useState<NewsSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(params: { topic?: string; country?: string; countryName?: string }) {
    setLoading(true);
    setError(null);
    try {
      const data = await searchNews(params);
      setResults(data);
    } catch (e: any) {
      setError(e.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleTopicSubmit(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setSelectedIso2(null);
    setSelectedCountryName(null);
    runSearch({ topic: topic.trim() });
  }

  function handleCountrySelect(iso2: string, name: string) {
    setSelectedIso2(iso2);
    setSelectedCountryName(name);
    runSearch({ country: iso2, countryName: name, topic: topic.trim() || undefined });
  }

  const headerLabel = results
    ? results.query.topic && results.query.countryName
      ? `"${results.query.topic}" in ${results.query.countryName}`
      : results.query.topic
      ? `"${results.query.topic}"`
      : results.query.countryName
      ? results.query.countryName
      : 'Results'
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Globe2 size={22} className="text-blue-400" />
          Explore
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Search any topic, or spin the globe and click a country. Every result is graded by our Signal Check pipeline.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleTopicSubmit} className="mb-6">
        <div className="flex items-center gap-2 bg-[#151929] border border-[#1e2540] rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Search any topic — e.g. 'AI regulation', 'Federal Reserve', 'Mars rover'..."
            className="bg-transparent text-sm text-white outline-none flex-1 placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Two-column: globe + results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Globe column */}
        <div className="rounded-xl border border-[#1e2540] bg-[#0c0f1a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e2540] flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gray-400">3D Globe</span>
            <span className="text-[11px] text-gray-500">click any country</span>
          </div>
          <ExploreGlobe onCountrySelect={handleCountrySelect} selectedIso2={selectedIso2} />
          {selectedCountryName && (
            <div className="px-4 py-2 border-t border-[#1e2540] text-xs text-gray-300">
              Selected: <strong className="text-white">{selectedCountryName}</strong>
            </div>
          )}
        </div>

        {/* Results column */}
        <div className="rounded-xl border border-[#1e2540] bg-[#0c0f1a] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#1e2540] flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gray-400">
              {headerLabel ? `Results — ${headerLabel}` : 'Results'}
            </span>
            {results && (
              <span className="text-[11px] text-gray-500">
                {results.count} stories · avg ★ {results.avg_signal_score}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {!results && !loading && !error && (
              <div className="p-10 text-center text-gray-500 text-sm">
                <Globe2 size={36} className="mx-auto mb-3 text-gray-700" />
                Search a topic above or click a country on the globe to see graded news.
              </div>
            )}

            {loading && (
              <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin text-blue-400" />
                Fetching and grading articles...
              </div>
            )}

            {error && (
              <div className="p-6 text-rose-400 text-sm">
                <strong>Error:</strong> {error}
                <p className="text-gray-400 mt-2 text-xs">
                  This usually means the NEWS_API_KEY secret isn&apos;t set in Supabase, or you&apos;ve hit the
                  free-tier rate limit (100 requests/day).
                </p>
              </div>
            )}

            {results && results.articles.length === 0 && (
              <div className="p-10 text-center text-gray-500 text-sm">
                No articles found for this query.
              </div>
            )}

            {results && results.articles.length > 0 && (
              <ul className="divide-y divide-[#1e2540]">
                {results.articles.map((a, i) => (
                  <ResultRow key={`${a.url}-${i}`} article={a} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ article }: { article: GradedArticle }) {
  const date = new Date(article.published_at);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <li className="p-4 hover:bg-[#151929] transition-colors">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
        <div className="flex gap-3">
          {article.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image_url}
              alt=""
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-[#1e2540]"
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <SignalScoreBadge score={article.signal_score} />
              <span className="text-[11px] text-gray-500 truncate">{article.source_name}</span>
              <span className="text-[11px] text-gray-600">·</span>
              <span className="text-[11px] text-gray-500">{dateStr}</span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
              {article.title}
              <ExternalLink size={11} className="inline ml-1 opacity-50" />
            </h3>
            {article.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{article.description}</p>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}
