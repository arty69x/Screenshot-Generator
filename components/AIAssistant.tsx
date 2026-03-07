'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Upload, Copy, Eye, Code, Download, Sparkles, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `
Pixel-Perfect Screenshot → Tailwind / TSX Assistant

SYSTEM ROLE
You are an advanced UI reverse-engineering engine and frontend architect.
Your job is to analyze UI screenshots and reconstruct the interface as pixel-perfect DOM structures.

PRIMARY OBJECTIVE
From an uploaded screenshot, detect and output:
• every UI node
• node hierarchy
• width and height
• x/y position
• content inside nodes
• layer stacking order
• layout structure
• styling information

Then generate:
1. Tailwind HTML
2. Tailwind TSX component

ABSOLUTE RULES
You must:
• detect all visible UI nodes
• preserve exact layout relationships
• preserve pixel spacing
• preserve container structure
• reconstruct a full DOM tree

RESPONSE FORMAT (LOCKED)
The AI must return ONLY:
---HTML---
[Tailwind HTML]
---TSX---
[Tailwind TSX]

No explanations.
`;

export function AIAssistant() {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !image) return;
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing. Please configure NEXT_PUBLIC_GEMINI_API_KEY.');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const contents: any[] = [];
      if (image) {
        contents.push({
          inlineData: {
            mimeType: 'image/png',
            data: image.split(',')[1],
          },
        });
      }
      contents.push({ text: prompt || "Analyze this screenshot and generate pixel-perfect Tailwind HTML and TSX code." });

      const result = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: contents },
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });
      setResponse(result.text || 'No code generated.');
    } catch (error) {
      console.error('Error generating code:', error);
      setResponse(error instanceof Error ? error.message : 'Error generating code.');
    } finally {
      setLoading(false);
    }
  };

  const parseResponse = (res: string) => {
    const htmlMatch = res.match(/---HTML---\n([\s\S]*?)\n---TSX---/);
    const tsxMatch = res.match(/---TSX---\n([\s\S]*)/);
    return {
      html: htmlMatch ? htmlMatch[1] : '',
      tsx: tsxMatch ? tsxMatch[1] : res
    };
  };

  const { html, tsx } = parseResponse(response);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (!mounted) return <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 h-64">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5" /> Pixel-Perfect AI Assistant
      </h2>
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
      <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 border border-zinc-300 py-2 px-4 rounded-lg mb-4 hover:bg-zinc-50">
        <Upload className="w-4 h-4" /> {image ? 'Change Image' : 'Upload Screenshot'}
      </button>
      {image && <img src={image} alt="Upload" className="w-full h-32 object-contain mb-4 rounded-lg" />}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe specific details or layout requirements..."
        className="w-full h-24 p-3 border border-zinc-300 rounded-lg mb-4"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-zinc-400"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
        {loading ? 'Analyzing & Generating...' : 'Generate Pixel-Perfect Code'}
      </button>
      {response && (
        <div className="mt-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => copyToClipboard(html)} className="flex items-center gap-1 text-sm bg-zinc-200 px-3 py-1 rounded hover:bg-zinc-300">
              <Copy className="w-4 h-4" /> Copy HTML
            </button>
            <button onClick={() => copyToClipboard(tsx)} className="flex items-center gap-1 text-sm bg-zinc-200 px-3 py-1 rounded hover:bg-zinc-300">
              <Copy className="w-4 h-4" /> Copy TSX
            </button>
            <button onClick={() => downloadFile(html, 'index.html')} className="flex items-center gap-1 text-sm bg-zinc-200 px-3 py-1 rounded hover:bg-zinc-300">
              <Download className="w-4 h-4" /> Download HTML
            </button>
            <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1 text-sm bg-zinc-200 px-3 py-1 rounded hover:bg-zinc-300">
              {showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showPreview ? 'Show Code' : 'Preview'}
            </button>
          </div>
          {showPreview ? (
            <iframe
              srcDoc={`<html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${html}</body></html>`}
              className="w-full h-96 border border-zinc-300 rounded-lg"
            />
          ) : (
            <div className="p-4 bg-zinc-900 text-zinc-100 rounded-lg overflow-x-auto text-sm font-mono">
              <h4 className="font-bold mb-2">HTML</h4>
              <pre className="mb-4">{html}</pre>
              <h4 className="font-bold mb-2">TSX</h4>
              <pre>{tsx}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
