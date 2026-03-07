'use client';
import React, { useState, useRef, useEffect, ErrorInfo } from 'react';
import { Bot, Upload, Sparkles, RefreshCw, AlertCircle, Image as ImageIcon, Eye, Code, Save, Trash2, Smartphone, Tablet, Monitor, Copy, Check } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: any) { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: ErrorInfo) { console.error("UI Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="p-4 bg-red-100 text-red-800 rounded-lg">Something went wrong. <button onClick={() => window.location.reload()} className="underline">Reload</button></div>;
    return this.props.children;
  }
}

const SYSTEM_PROMPT = `
Pixel-Perfect Screenshot → Tailwind / TSX Assistant

SYSTEM ROLE
You are an expert UI engineer and visual designer specializing in pixel-perfect reconstruction.
Your goal is to transform UI screenshots into production-ready Tailwind CSS and React (TSX) code in a SINGLE ATTEMPT.

PRIMARY OBJECTIVE
Analyze the screenshot with extreme precision. You must detect and reconstruct:
• Node Hierarchy & Layout: Detect all UI nodes, their hierarchy, stacking order, and layout structure (Flexbox/Grid).
• Dimensions & Positions: Precise width, height, and x/y positioning.
• Content & Styling: Exact text content, typography (font-size, weight, line-height), colors (Tailwind palette), spacing (padding/margin), and borders.
• Interactive Elements: Buttons, links, inputs, toggles with hover/focus states.
• Decorative Layers: Backgrounds, gradients, overlays, and shadows.

ABSOLUTE RULES
1. Pixel-Perfect: Map all dimensions and spacing to Tailwind's scale.
2. Tailwind-First: Use ONLY Tailwind utility classes. NO inline styles.
3. Interactive: Add hover states, focus states, and transitions to all interactive elements.
4. Responsive: Use mobile-first design (e.g., w-full md:w-1/2).
5. Modular: Break the UI into reusable components.
6. Single Attempt: Your output must be complete and visually identical to the screenshot.
7. Image Reliability: For all images, use high-quality Unsplash URLs. ALWAYS include an 'onError' handler that sets the image 'src' to a reliable fallback URL (e.g., 'https://picsum.photos/seed/fallback/800/600') if the primary image fails to load.

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
  const [editableHtml, setEditableHtml] = useState('');
  const [editableTsx, setEditableTsx] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState<'mobile' | 'tablet' | 'desktop' | 'widescreen'>('desktop');
  const [projects, setProjects] = useState<any[]>([]);
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ai_assistant_projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (response) {
      const { html, tsx } = parseResponse(response);
      setEditableHtml(html);
      setEditableTsx(tsx);
    }
  }, [response]);

  const formatCode = async () => {
    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: editableHtml, tsx: editableTsx }),
      });
      
      if (!res.ok) throw new Error('Formatting failed');
      const { html, tsx } = await res.json();
      setEditableHtml(html);
      setEditableTsx(tsx);
    } catch (e) {
      console.error("Formatting failed", e);
      setError("Formatting failed. Please check your code for syntax errors.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !image) {
      setError('Please provide an image or a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setResponse('');
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image }),
      });
      
      if (res.status === 401 || res.status === 403) throw new Error('Invalid or expired API Key. Please check configuration.');
      if (res.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      if (!res.ok) throw new Error(`Generation failed (Status: ${res.status}). Please try again.`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        setResponse((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const saveProject = () => {
    const newProject = { id: Date.now(), prompt, image, html: editableHtml, tsx: editableTsx, timestamp: new Date().toLocaleString() };
    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('ai_assistant_projects', JSON.stringify(updated));
  };

  const loadProject = (p: any) => {
    setLoadingProject(p.id);
    setTimeout(() => {
      setPrompt(p.prompt);
      setImage(p.image);
      setEditableHtml(p.html);
      setEditableTsx(p.tsx);
      setLoadingProject(null);
    }, 500);
  };

  const deleteProject = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('ai_assistant_projects', JSON.stringify(updated));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseResponse = (res: string) => {
    const htmlMatch = res.match(/---HTML---\n([\s\S]*?)\n---TSX---/);
    const tsxMatch = res.match(/---TSX---\n([\s\S]*)/);
    return {
      html: htmlMatch ? htmlMatch[1] : '',
      tsx: tsxMatch ? tsxMatch[1] : res
    };
  };

  if (!mounted) return <div className="p-8 text-center">Loading...</div>;

  const previewWidths = { mobile: '375px', tablet: '768px', desktop: '100%', widescreen: '1440px' };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900">
              <Bot className="w-6 h-6 text-indigo-600" /> Pixel Engine
            </h1>
            <div className="space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 border border-zinc-200 py-3 px-4 rounded-xl hover:bg-zinc-50">
                <Upload className="w-4 h-4" /> {image ? 'Change Image' : 'Upload Screenshot'}
              </button>
              {image && <img src={image} alt="Upload" className="w-full h-40 object-cover rounded-xl border border-zinc-200" />}
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe UI details..." className="w-full p-4 border border-zinc-200 rounded-xl h-24 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button onClick={handleGenerate} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-3 px-4 rounded-xl hover:bg-zinc-800 disabled:bg-zinc-400 font-medium">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
                {loading ? 'Analyzing...' : 'Generate Code'}
              </button>
              {response && <button onClick={saveProject} className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-3 px-4 rounded-xl hover:bg-indigo-100 font-medium"><Save className="w-4 h-4" /> Save Project</button>}
            </div>
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-sm">Saved Projects</h3>
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 hover:bg-zinc-100 rounded-lg">
                  <button onClick={() => loadProject(p)} className="text-xs text-left truncate flex-1 flex items-center gap-2">
                    {loadingProject === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    {p.timestamp} - {p.prompt.substring(0, 15)}...
                  </button>
                  <button onClick={() => deleteProject(p.id)} className="text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>}
            {response && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
                <div className="flex gap-2 items-center border-b pb-4 overflow-x-auto">
                  <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 whitespace-nowrap">
                    {showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showPreview ? 'View Code' : 'View Preview'}
                  </button>
                  <button onClick={() => copyToClipboard(parseResponse(response).tsx)} className="flex items-center gap-2 text-sm bg-zinc-100 px-4 py-2 rounded-lg hover:bg-zinc-200 whitespace-nowrap">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} Copy Code
                  </button>
                  {showPreview && (
                    <div className="flex gap-1 ml-auto border border-zinc-200 rounded-xl p-1 transition-all duration-300">
                      <button onClick={() => setPreviewSize('mobile')} className={`p-2 rounded-lg ${previewSize === 'mobile' ? 'bg-zinc-100' : ''}`}><Smartphone className="w-4 h-4" /></button>
                      <button onClick={() => setPreviewSize('tablet')} className={`p-2 rounded-lg ${previewSize === 'tablet' ? 'bg-zinc-100' : ''}`}><Tablet className="w-4 h-4" /></button>
                      <button onClick={() => setPreviewSize('desktop')} className={`p-2 rounded-lg ${previewSize === 'desktop' ? 'bg-zinc-100' : ''}`}><Monitor className="w-4 h-4" /></button>
                      <button onClick={() => setPreviewSize('widescreen')} className={`p-2 rounded-lg ${previewSize === 'widescreen' ? 'bg-zinc-100' : ''}`}><Monitor className="w-4 h-4" />+</button>
                    </div>
                  )}
                </div>
                {showPreview ? (
                  <div className="w-full flex justify-center border border-zinc-100 rounded-xl p-4 bg-zinc-50 overflow-x-auto transition-all duration-300">
                    <iframe srcDoc={`<html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${editableHtml}</body></html>`} style={{ width: previewWidths[previewSize], transition: 'width 0.3s' }} className="h-[500px] border border-zinc-200 rounded-xl bg-white shadow-inner" />
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-950 text-zinc-100 rounded-xl overflow-x-auto text-sm font-mono shadow-inner space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-zinc-400">HTML</h4>
                      <button onClick={formatCode} className="text-xs bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700">Format</button>
                    </div>
                    <textarea value={editableHtml} onChange={(e) => setEditableHtml(e.target.value)} className="w-full h-64 bg-transparent outline-none font-mono text-xs" />
                    <h4 className="font-bold mt-8 text-zinc-400">TSX</h4>
                    <textarea value={editableTsx} onChange={(e) => setEditableTsx(e.target.value)} className="w-full h-64 bg-transparent outline-none font-mono text-xs" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
