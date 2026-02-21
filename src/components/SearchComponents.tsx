import React from 'react';
import { Search, Loader2, ExternalLink, ChevronRight, Activity, Copy, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  isFastMode: boolean;
  onFastModeChange: (isFastMode: boolean) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading, isFastMode, onFastModeChange }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative group mb-3">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything (e.g., 'best electric cars in 2025')..."
          className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md"
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:hover:bg-gray-50 disabled:hover:text-gray-400 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </form>
      <div className="flex items-center justify-end px-2">
        <button
          type="button"
          onClick={() => onFastModeChange(!isFastMode)}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
            isFastMode 
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Zap className={`h-4 w-4 ${isFastMode ? 'fill-amber-500 text-amber-500' : ''}`} />
          Fast Mode (Queries Only)
        </button>
      </div>
    </div>
  );
};

interface KeywordChipProps {
  keyword: string;
  isActive: boolean;
  onClick: () => void;
  resultCount: number;
}

export const KeywordChip: React.FC<KeywordChipProps> = ({ keyword, isActive, onClick, resultCount }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
      }`}
    >
      <span className="truncate mr-2">{keyword}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
      }`}>
        {resultCount}
      </span>
    </motion.button>
  );
};

interface ExecutedQueryProps {
  query: string;
}

export const ExecutedQuery: React.FC<ExecutedQueryProps> = ({ query }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-start justify-between text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 font-mono hover:border-indigo-300 transition-colors shadow-sm">
      <div className="mr-3 break-words leading-relaxed">"{query}"</div>
      <button
        onClick={handleCopy}
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-gray-100"
        title="Copy query"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

interface ResultCardProps {
  result: {
    title: string;
    url: string;
    snippet: string;
    keyword: string;
  };
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md truncate max-w-[150px]">
              {result.keyword}
            </span>
            <span className="text-xs text-gray-400 truncate max-w-[200px]">{new URL(result.url).hostname}</span>
          </div>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate"
          >
            {result.title}
          </a>
        </div>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 p-2 text-gray-300 hover:text-indigo-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {result.snippet}
      </p>
    </motion.div>
  );
};

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-20 px-4">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Activity className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to research</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Enter a query above to see how AI breaks it down into targeted searches and finds real-time information.
      </p>
    </div>
  );
};

