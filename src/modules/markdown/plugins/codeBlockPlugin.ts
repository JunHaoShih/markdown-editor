import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { v4 as uuidv4 } from 'uuid';

interface CodeBlockOptions {
  /**
   * Class name to style your code
   */
  highlightClass: string,
  /**
   * Your copy button in code block, won't display if undefined
   */
  copyBtn?: {
    /**
     * Attribute name of the copy button, uuid of code block will be stored in this attribute.
     * User has to catch onclick event by themselves.
     * When event target has the attribute, get the text content of that element
     * ```ts
     * const target = evt.target as HTMLElement | null;
     * const clipboardTargetId = target?.getAttribute(btnAttributeName);
     * const textToCopy = document.getElementById(clipboardTargetId)?.textContent;
     * ```
     */
    attribute: string,
    /**
     * Style your button
     */
    btnClass?: string,
  },
  /**
   * Style your code block
   */
  codeClass?: string,
}

export const codeBlockPlugin: MarkdownIt.PluginWithOptions<CodeBlockOptions> = (md, options) => {
  const copyIcon = '<i class="q-icon notranslate material-icons" aria-hidden="true" role="img">content_copy</i>';

  /**
   * This plugin is used to highlight code blocks in markdown.
   * It uses highlight.js for syntax highlighting.
   * It also adds a copy button to each code block.
   * The copy button uses the provided UUID to uniquely identify each code block.
   */
  md.options.highlight = (str, lang) => {
    const uuid = uuidv4();

    const pre = document.createElement('pre');
    if (options) {
      pre.className = options.highlightClass;
    }

    if (options && options.copyBtn) {
      const btn = document.createElement('button');
      if (options?.copyBtn?.btnClass) {
        btn.className = options.copyBtn.btnClass;
      }
      btn.innerHTML = copyIcon;
      btn.setAttribute(options.copyBtn.attribute, uuid);
      pre.appendChild(btn);
    }

    const code = document.createElement('code');
    if (options && options.codeClass) {
      code.className = options.codeClass;
    }
    code.id = uuid;
    pre.appendChild(code);
    if (lang && hljs.getLanguage(lang)) {
      try {
        code.innerHTML = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        return pre.outerHTML;
      } catch (__) { /* empty */ }
    }

    code.innerHTML = md.utils.escapeHtml(str);
    return pre.outerHTML;
  };
};
