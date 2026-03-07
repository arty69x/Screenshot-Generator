import { GoogleGenAI } from '@google/genai';

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

async function generateContent(apiKey: string, prompt: string, image: string) {
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
  contents.push({ text: prompt || "Generate pixel-perfect Tailwind HTML and TSX code." });

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
    const { prompt, image } = await req.json();
    const primaryKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const subKey = process.env.NEXT_PUBLIC_GEMINI_SUB_API_KEY;

    let stream;
    let lastError;

    // Try primary key
    if (primaryKey) {
      try {
        stream = await generateContent(primaryKey, prompt, image);
      } catch (error) {
        lastError = error;
        console.warn('Primary API key failed:', error);
      }
    }

    // Try fallback key if primary failed or missing
    if (!stream && subKey) {
      try {
        stream = await generateContent(subKey, prompt, image);
      } catch (error) {
        lastError = error;
        console.warn('Fallback API key failed:', error);
      }
    }

    if (!stream) {
      throw lastError || new Error('Both primary and fallback API keys failed or are missing.');
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        } catch (error) {
          console.error('Streaming error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error generating code. Please check your API keys.' }), { status: 500 });
  }
}
