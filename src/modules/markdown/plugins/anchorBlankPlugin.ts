import MarkdownIt from 'markdown-it';

export const anchorBlankPlugin: MarkdownIt.PluginSimple = (md) => {
  const defaultLinkRender = md.renderer.rules.link_open
  || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = ((tokens, idx, options, env, self) => {
    // If you are sure other plugins can't add `target` - drop check below
    const aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank']); // add new attribute
    } else {
      tokens[idx].attrSet('target', '_blank');// replace value of existing attr
    }

    // pass token to default renderer.
    return defaultLinkRender(tokens, idx, options, env, self);
  });
};
