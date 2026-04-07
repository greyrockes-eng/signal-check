'use client';

import { useEffect, useState } from 'react';
import { supabase, Article, Topic } from '@/lib/supabase';
import TopicBar from '@/components/TopicBar';
import ArticleCard from '@/components/ArticleCard';
import { TrendingUp, BarChart3, Shield } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch topics
      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .order('name');

      if (topicsData) setTopics(topicsData);

      // Fetch articles with topic info
      let query = supabase
        .from('articles')
        .select('*, topics(*)')
        .order('published_at', { ascending: false });

      if (activeTopic) {
        const topic = topicsData?.find((t) => t.slug === activeTopic);
        if (topic) {
          query = query.eq('topic_id', topic.id);
        }
      }

      const { data: articlesData } = await query;
      if (articlesData) setArticles(articlesData);

      setLoading(false);
    }

    fetchData();
  }, [activeTopic]);

  const featuredArticle = articles[0];
  const restArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Stats bar */}
      <div className="flex items-center gap-6 py-5 border-b border-[#1e2540] text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-blue-400" />
          <span><strong className="text-white">6</strong> stories analyzed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-purple-400" />
          <span><strong className="text-white">8</strong> sources tracked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-emerald-400" />
          <span>Avg trust score: <strong className="text-emerald-400">7.8</strong></span>
        </div>
      </div>

      {/* Topic filter bar */}
      <TopicBar
        topics={topics}
        activeTopic={activeTopic}
        onTopicChange={setActiveTopic}
      />

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1e2540] bg-[#151929] h-64 animate-pulse"
            />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No stories found for this topic yet.</p>
          <p className="text-sm mt-2">Check back soon — our AI is always scanning.</p>
        </div>
      ) : (
        <div className="space-y-5 mt-2">
          {/* Featured article */}
          {featuredArticle && (
            <ArticleCard article={featuredArticle} featured />
          )}

          {/* Grid of remaining articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {restArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
