import MarkdownIt from 'markdown-it';
import mermaid, { MermaidConfig } from 'mermaid';

interface MermaidOptions {
  /**
   * Class name to style your pre wrapper
   */
  preClass?: string,
  /**
   * Mermaid config
   */
  config?: MermaidConfig,
}

export const mermaidPlugin: MarkdownIt.PluginWithOptions<MermaidOptions> = (md, mermaidOptions) => {
  if (mermaidOptions) {
    mermaid.initialize({
      ...mermaidOptions.config,
    });
  }

  /**
   * This field is used to save last valid mermaid code,
   * so user can still see their diagram when having syntax error.
   */
  let previousCode: string | undefined;

  function generatePre(id: string, code: string, error?: unknown): string {
    const pre = document.createElement('pre');
    if (mermaidOptions?.preClass) {
      pre.className = mermaidOptions.preClass;
    }
    const svg = mermaid.mermaidAPI.render(id, code);
    pre.innerHTML = svg;

    // Append error message at the end of diagram
    if (error) {
      const errorMsg = (error instanceof Error)
        ? error.message : String(error);
      const div = document.createElement('div');
      div.innerText = errorMsg;
      div.style.color = 'red';
      pre.appendChild(div);
    }
    return pre.outerHTML;
  }

  // Store reference to original renderer.
  const defaultFenceRenderer = md.renderer.rules.fence
  || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info.toLowerCase().trim();

    if (info !== 'mermaid') {
      return defaultFenceRenderer(tokens, idx, options, env, self);
    }

    // Using token index as svg locater
    const id = `mermaid-${idx}`;
    try {
      const preString = generatePre(id, token.content);
      previousCode = token.content;
      return preString;
    } catch (error) {
      if (previousCode) {
        return generatePre(id, previousCode, error);
      }
      return '<pre>Syntax error!</pre>';
    }
  };
};
