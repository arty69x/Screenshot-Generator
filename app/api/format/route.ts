import { NextResponse } from 'next/server';
import prettier from 'prettier';
import * as parserHtml from 'prettier/plugins/html';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as pluginTailwind from 'prettier-plugin-tailwindcss';

export async function POST(req: Request) {
  try {
    const { html, tsx } = await req.json();
    
    const formattedHtml = await prettier.format(html, {
      parser: 'html',
      plugins: [parserHtml, pluginTailwind],
    });
    
    const formattedTsx = await prettier.format(tsx, {
      parser: 'babel',
      plugins: [parserBabel, parserEstree, pluginTailwind],
    });
    
    return NextResponse.json({ html: formattedHtml, tsx: formattedTsx });
  } catch (e) {
    console.error("Formatting failed", e);
    return NextResponse.json({ error: 'Formatting failed' }, { status: 500 });
  }
}
