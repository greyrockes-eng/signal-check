'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Search, Globe2, Loader2, ExternalLink, TrendingUp, Briefcase, FlaskConical, Heart, Cpu, Trophy, Film, Newspaper, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import ExploreGlobe from '@/components/ExploreGlobe';
import SignalScoreBadge from '@/components/SignalScoreBadge';
import BiasMeter from '@/components/BiasMeter';
import { searchNews, GradedArticle, NewsSearchResponse } from '@/lib/newsSearch';
import { gradeClaims, GradedClaim } from '@/lib/gradeClaims';

// Group articles that appear to cover the same story based on title token overlap.
// Returns a list of "story clusters" — each cluster is one lead article plus any
// other articles from different sources that share ≥50% of meaningful title words.
interface StoryCluster {
  lead: GradedArticle;
  sources: GradedArticle[]; // includes lead
}

const STOPWORDS = new Set([
  'the','a','an','and','or','but','of','in','on','at','to','for','with','by',
  'from','as','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','must','can',
  'this','that','these','those','it','its','he','she','they','them','his','her',
  'their','our','we','you','your','i','my','me','not','no','so','if','than',
  'then','up','down','out','over','under','about','after','before','into','new',
  'says','say','said','will','us','vs',
]);

function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function clusterArticles(articles: GradedArticle[]): StoryCluster[] {
  const clusters: StoryCluster[] = [];
  const used = new Set<number>();

  for (let i = 0; i < articles.length; i++) {
    if (used.has(i)) continue;
    const leadTokens = titleTokens(articles[i].title);
    const cluster: StoryCluster = { lead: articles[i], sources: [articles[i]] };
    used.add(i);

    for (let j = i + 1; j < articles.length; j++) {
      if (used.has(j)) continue;
      if (articles[j].source_name === articles[i].source_name) continue;
      const otherTokens = titleTokens(articles[j].title);
      if (leadTokens.size === 0 || otherTokens.size === 0) continue;
      let overlap = 0;
      for (const t of otherTokens) if (leadTokens.has(t)) overlap++;
      const smaller = Math.min(leadTokens.size, otherTokens.size);
      if (overlap / smaller >= 0.5 && overlap >= 2) {
        cluster.sources.push(articles[j]);
        used.add(j);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

type Category = {
  id: string;
  label: string;
  apiValue: string | null; // null means "top stories" (no category filter)
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const CATEGORIES: Category[] = [
  { id: 'top', label: 'Top Stories', apiValue: null, icon: TrendingUp },
  { id: 'general', label: 'World', apiValue: 'general', icon: Newspaper },
  { id: 'business', label: 'Business', apiValue: 'business', icon: Briefcase },
  { id: 'technology', label: 'Tech', apiValue: 'technology', icon: Cpu },
  { id: 'science', label: 'Science', apiValue: 'science', icon: FlaskConical },
  { id: 'health', label: 'Health', apiValue: 'health', icon: Heart },
  { id: 'sports', label: 'Sports', apiValue: 'sports', icon: Trophy },
  { id: 'entertainment', label: 'Entertainment', apiValue: 'entertainment', icon: Film },
];

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('top');
  const [selectedIso2, setSelectedIso2] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [results, setResults] = useState<NewsSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load top stories on first mount
  useEffect(() => {
    runSearch({ category: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(params: {
    topic?: string;
    country?: string;
    countryName?: string;
    category?: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      // For "top stories" we still need to send something — the edge function
      // defaults to US top headlines when given no params, but we want to be
      // explicit so the cache key is stable.
      const query: typeof params = { ...params };
      if (!query.topic && !query.country && !query.category) {
        query.category = 'general';
      }
      const data = await searchNews(query);
      setResults(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Search failed';
      setError(message);
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
    setActiveCategory('');
    runSearch({ topic: topic.trim() });
  }

  function handleCountrySelect(iso2: string, name: string) {
    setSelectedIso2(iso2);
    setSelectedCountryName(name);
    setActiveCategory('');
    runSearch({
      country: iso2,
      countryName: name,
      topic: topic.trim() || undefined,
    });
  }

  function handleCategoryClick(cat: Category) {
    setActiveCategory(cat.id);
    setSelectedIso2(null);
    setSelectedCountryName(null);
    setTopic('');
    runSearch({ category: cat.apiValue || undefined });
  }

  const headerLabel = (() => {
    if (!results) return null;
    if (results.query.topic && results.query.countryName) {
      return `"${results.query.topic}" in ${results.query.countryName}`;
    }
    if (results.query.topic) return `"${results.query.topic}"`;
    if (results.query.countryName) return results.query.countryName;
    if (results.query.category) {
      const c = CATEGORIES.find((x) => x.apiValue === results.query.category);
      return c ? c.label : results.query.category;
    }
    return 'Top Stories';
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
      {/* Hero header */}
      <div className="mb-5 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          <Globe2 size={26} className="text-blue-400" />
          The world&apos;s news, graded for truth
        </h1>
        <p className="text-sm text-gray-400 mt-1.5">
          Search any topic, click a country on the globe, or browse by category. Every story is scored for source reliability and political bias.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleTopicSubmit} className="mb-4">
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

      {/* Category tabs */}
      <div className="mb-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto">
        <div className="flex items-center gap-2 pb-1 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                disabled={loading}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-500/15 border-blue-500/60 text-blue-300'
                    : 'bg-[#151929] border-[#1e2540] text-gray-300 hover:text-white hover:border-[#2a3358]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Icon size={13} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

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
                Pick a category, search a topic, or click a country on the globe.
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
                  This usually means the news source is rate-limited (free tier is 100 requests/day) or temporarily unavailable. Try again in a moment.
                </p>
              </div>
            )}

            {results && results.articles.length === 0 && !loading && (
              <div className="p-10 text-center text-gray-500 text-sm">
                No articles found for this query.
              </div>
            )}

            {results && results.articles.length > 0 && (
              <ul className="divide-y divide-[#1e2540]">
                {clusterArticles(results.articles).map((c, i) => (
                  <ResultRow key={`${c.lead.url}-${i}`} cluster={c} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ cluster }: { cluster: StoryCluster }) {
  const article = cluster.lead;
  const sourceCount = cluster.sources.length;
  // Average bias across all sources covering this story — gives a fairer picture
  // of where the overall narrative sits on the left-center-right scale.
  const avgBias =
    cluster.sources.reduce((s, a) => s + a.bias_rating, 0) / sourceCount;
  const date = new Date(article.published_at);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const [claimsOpen, setClaimsOpen] = useState(false);
  const [claims, setClaims] = useState<GradedClaim[] | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  async function toggleClaims(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const willOpen = !claimsOpen;
    setClaimsOpen(willOpen);
    if (willOpen && !claims && !claimsLoading) {
      setClaimsLoading(true);
      setClaimsError(null);
      try {
        const others = cluster.sources.slice(1).map((s) => ({
          source_name: s.source_name,
          title: s.title,
          description: s.description || '',
        }));
        const result = await gradeClaims({
          lead: {
            url: article.url,
            source_name: article.source_name,
            title: article.title,
            description: article.description || '',
          },
          others,
        });
        if (!result.success) throw new Error(result.error || 'grading failed');
        setClaims(result.claims);
      } catch (err) {
        setClaimsError(err instanceof Error ? err.message : 'grading failed');
      } finally {
        setClaimsLoading(false);
      }
    }
  }

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
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <SignalScoreBadge score={article.signal_score} />
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
              </span>
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
            {/* Left-Center-Right bias scale */}
            <div className="mt-2.5 max-w-[240px]">
              <BiasMeter bias={avgBias} />
            </div>
            {sourceCount > 1 && (
              <div className="mt-2 text-[10px] text-gray-500">
                Also covered by:{' '}
                <span className="text-gray-400">
                  {cluster.sources.slice(1).map((s) => s.source_name).join(', ')}
                </span>
              </div>
            )}

            {/* Claims toggle */}
            <button
              type="button"
              onClick={toggleClaims}
              className="mt-3 flex items-center gap-1 text-[11px] font-medium text-blue-300 hover:text-blue-200 transition-colors"
            >
              {claimsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {claimsOpen ? 'Hide' : 'Check'} claims
            </button>

            {claimsOpen && (
              <div className="mt-2 rounded-lg border border-[#1e2540] bg-[#0c0f1a] p-3">
                {claimsLoading && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Loader2 size={12} className="animate-spin text-blue-400" />
                    Extracting and cross-checking claims...
                  </div>
                )}
                {claimsError && (
                  <div className="text-[11px] text-rose-400">
                    Couldn&apos;t grade claims: {claimsError}
                  </div>
                )}
                {claims && claims.length === 0 && (
                  <div className="text-[11px] text-gray-500">
                    No specific factual claims found in this snippet.
                  </div>
                )}
                {claims && claims.length > 0 && (
                  <ul className="space-y-2">
                    {claims.map((c, idx) => {
                      const isOpinion = c.claim_type === 'opinion';
                      const confirmed = c.confirmation_count >= 3;
                      const single = c.confirmation_count === 1;
                      const Icon = isOpinion
                        ? HelpCircle
                        : confirmed
                        ? CheckCircle2
                        : single
                        ? AlertTriangle
                        : CheckCircle2;
                      const color = isOpinion
                        ? 'text-amber-400'
                        : confirmed
                        ? 'text-emerald-400'
                        : single
                        ? 'text-amber-400'
                        : 'text-blue-300';
                      const label = isOpinion
                        ? 'Opinion'
                        : `${c.confirmation_count} of ${c.total_cluster_sources} sources`;
                      return (
                        <li key={idx} className="flex gap-2">
                          <Icon size={13} className={`${color} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-gray-200 leading-snug">
                              {c.claim_text}
                            </p>
                            <p className={`text-[10px] mt-0.5 ${color}`}>{label}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}
