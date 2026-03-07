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
• Apply standard UI patterns:
  - Buttons: Add hover:bg-opacity-80, transition-all, cursor-pointer.
  - Inputs: Add focus:ring-2, focus:ring-indigo-500.
  - Interactive elements: Add hover:scale-105, transition-transform where appropriate.
  - Use standard Tailwind utility classes for all styling.

RESPONSE FORMAT (LOCKED)
The AI must return ONLY:
---HTML---
[Tailwind HTML]
---TSX---
[Tailwind TSX]

No explanations.
`;

async function generateContent(apiKey: string, prompt: string, image: string, section: string) {
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
  contents.push({ text: `Analyze this screenshot section: ${section || 'Full UI'}. ${prompt || "Generate pixel-perfect Tailwind HTML and TSX code."}` });

  return await ai.models.generateContentStream({
    model: 'gemini-3.1-pro-preview',
    contents: { parts: contents },
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { prompt, image, section } = await req.json();
    const primaryKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const subKey = process.env.NEXT_PUBLIC_GEMINI_SUB_API_KEY;

    let stream;
    try {
      if (!primaryKey) throw new Error('Primary key missing');
      stream = await generateContent(primaryKey, prompt, image, section);
    } catch (error) {
      console.warn('Primary API key failed, trying fallback:', error);
      if (!subKey) throw new Error('Both primary and fallback API keys failed or are missing.');
      stream = await generateContent(subKey, prompt, image, section);
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return new Response(JSON.stringify({ error: 'Error generating code. Please check your API keys.' }), { status: 500 });
  }
}
