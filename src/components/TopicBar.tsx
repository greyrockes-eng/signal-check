'use client';

import { Topic } from '@/lib/supabase';

interface TopicBarProps {
  topics: Topic[];
  activeTopic: string | null;
  onTopicChange: (slug: string | null) => void;
}

export default function TopicBar({ topics, activeTopic, onTopicChange }: TopicBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4 px-1 scrollbar-hide">
      <button
        onClick={() => onTopicChange(null)}
        className={`topic-chip flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
          activeTopic === null
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-[#151929] text-gray-300 border-[#1e2540] hover:border-gray-500'
        }`}
      >
        All Stories
      </button>
      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onTopicChange(topic.slug)}
          className={`topic-chip flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            activeTopic === topic.slug
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-[#151929] text-gray-300 border-[#1e2540] hover:border-gray-500'
          }`}
        >
          {topic.icon} {topic.name}
        </button>
      ))}
    </div>
  );
}
