'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function AIContentGenerator() {
  const [mounted, setMounted] = useState(false);
  const [context, setContext] = useState('hero section');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateContent = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: `Generate realistic, creative, and professional placeholder content for a ${context}. Include relevant fields like titles, descriptions, or features as appropriate for the context. Return the output in a clean, readable format.`,
      });
      setContent(response.text || 'No content generated.');
    } catch (error) {
      console.error('Error generating content:', error);
      setContent('Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  if (!mounted) return <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 h-64">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" /> AI Content Generator
      </h2>
      <select 
        value={context} 
        onChange={(e) => setContext(e.target.value)}
        className="w-full p-2 border border-zinc-300 rounded-lg mb-4"
      >
        <option value="hero section">Hero Section</option>
        <option value="product card">Product Card</option>
        <option value="blog post">Blog Post</option>
        <option value="feature list">Feature List</option>
      </select>
      <button
        onClick={generateContent}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-zinc-400 mb-2"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
        {loading ? 'Generating...' : 'Generate Content'}
      </button>
      {content && (
        <div className="mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-zinc-900">Generated Content</h3>
            <button onClick={copyToClipboard} className="text-zinc-500 hover:text-zinc-700">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-zinc-700 whitespace-pre-wrap">{content}</div>
        </div>
      )}
    </div>
  );
}
