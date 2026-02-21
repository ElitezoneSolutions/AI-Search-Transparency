/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { performTransparentSearch, TransparencyResponse, SearchResult } from './services/aiService';
import { SearchInput, KeywordChip, ResultCard, EmptyState, ExecutedQuery } from './components/SearchComponents';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Search as SearchIcon, Sparkles, Activity, Zap } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
  const [data, setData] = useState<TransparencyResponse | null>(null);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setActiveKeyword(null);

    try {
      setLoadingStep('Analyzing query intent...');
      // Artificial delay for UX to show the steps
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setLoadingStep('Generating search strategies...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (!isFastMode) {
        setLoadingStep('Executing real-time web searches...');
      }
      const response = await performTransparentSearch(query, isFastMode);
      
      setData(response);
      if (response.keywords.length > 0) {
        setActiveKeyword('all');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const filteredResults = React.useMemo(() => {
    if (!data) return [];
    if (activeKeyword === 'all' || !activeKeyword) return data.results;
    return data.results.filter(r => r.keyword === activeKeyword);
  }, [data, activeKeyword]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="bg-indigo-100 p-2 rounded-xl mr-3">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase mr-2">AI Search Transparency</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            See how AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">thinks & searches</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Enter a complex query. Watch the AI break it down into sub-tasks and perform real web searches to find the answer.
            <br />
            <span className="text-xs text-gray-400 mt-2 block">Powered by Google Gemini 3 Flash Preview</span>
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <SearchInput 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            isFastMode={isFastMode}
            onFastModeChange={setIsFastMode}
          />
          {data && !isLoading && (
            <button
              onClick={() => {
                setData(null);
                setActiveKeyword(null);
              }}
              className="absolute -top-12 right-0 text-sm text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <Activity className="h-4 w-4" />
              Clear Results
            </button>
          )}
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-indigo-100">
                  <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">{loadingStep}</p>
              <div className="mt-2 flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto p-4 bg-red-50 text-red-600 rounded-xl text-center mb-8 border border-red-100">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            
            {/* Left Panel: Keywords */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">AI Strategy</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  The AI identified {data.keywords.length} key areas to research for your query.
                </p>
                
                <div className="space-y-3">
                  <KeywordChip
                    keyword="All Results"
                    isActive={activeKeyword === 'all'}
                    onClick={() => setActiveKeyword('all')}
                    resultCount={data.results.length}
                  />
                  {data.keywords.map((keyword, idx) => (
                    <KeywordChip
                      key={idx}
                      keyword={keyword}
                      isActive={activeKeyword === keyword}
                      onClick={() => setActiveKeyword(keyword)}
                      resultCount={data.results.filter(r => r.keyword === keyword).length}
                    />
                  ))}
                </div>

                {data.actualQueries && data.actualQueries.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <SearchIcon className="h-4 w-4 text-indigo-600" />
                        {data.isFastMode ? 'Generated Search Queries' : 'Executed Search Queries'}
                      </h3>
                      <button
                        onClick={() => {
                          const allQueries = data.actualQueries?.join('\n');
                          if (allQueries) navigator.clipboard.writeText(allQueries);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="space-y-2">
                      {data.actualQueries.map((query, idx) => (
                        <ExecutedQuery key={idx} query={query} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Results */}
            <div className="lg:col-span-8 space-y-8">
              {data.answer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-indigo-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    AI Synthesis
                  </h2>
                  <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
                    {data.answer}
                  </div>
                  
                  {data.results.length > 0 && !data.isFastMode && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sources used in synthesis</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(data.results.map(r => new URL(r.url).hostname))).map((host, i) => (
                          <span key={i} className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-1 rounded-md">
                            {host}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                    Search Results
                  </h2>
                  {!data.isFastMode && (
                    <span className="text-sm text-gray-500">
                      Showing {filteredResults.length} sources
                    </span>
                  )}
                </div>

                {data.isFastMode ? (
                  <div className="text-center py-16 bg-amber-50 rounded-2xl border border-amber-100 border-dashed">
                    <Zap className="h-10 w-10 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">Fast Mode Enabled</h3>
                    <p className="text-amber-700 max-w-sm mx-auto">
                      Web search was skipped. The AI generated the search strategies and queries it would use.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((result, idx) => (
                        <ResultCard key={idx} result={result} />
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <p className="text-gray-400">No results found for this specific keyword.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !data && !error && <EmptyState />}
      </div>
      <Analytics />
    </div>
  );
}

