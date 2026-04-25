import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

export function remarkEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      const regex = /@@(.+?)@@/g;
      const content = toString(node);
      
      if (regex.test(content)) {
        const children = [];
        let lastIndex = 0;
        
        content.replace(regex, (match, inner, offset) => {
          // Add text before the match
          if (offset > lastIndex) {
            children.push({
              type: 'html',
              value: content.slice(lastIndex, offset)
            });
          }
          
          let html = '';
          const trimmedInner = inner.trim();

          // Check if the inner content is already an HTML tag (like <iframe>)
          if (trimmedInner.startsWith('<') && trimmedInner.endsWith('>')) {
            html = `<div class="embed-container">${trimmedInner}</div>`;
          } 
          // Otherwise treat it as a URL
          else {
            const url = trimmedInner;
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              const videoId = url.includes('watch?v=') 
                ? url.split('watch?v=')[1].split('&')[0] 
                : url.split('/').pop();
              html = `<div class="embed-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
            } else if (url.includes('spotify.com')) {
              const embedUrl = url.replace('/track/', '/embed/track/').replace('/album/', '/embed/album/').replace('/show/', '/embed/show/');
              html = `<div class="embed-container"><iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`;
            } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(url)) {
              html = `<img src="${url}" alt="Embedded Image" style="max-width: 100%; height: auto;" />`;
            } else {
              html = `<a href="${url}" target="_blank">${url}</a>`;
            }
          }
          
          children.push({
            type: 'html',
            value: html
          });
          
          lastIndex = offset + match.length;
        });
        
        if (lastIndex < content.length) {
          children.push({
            type: 'html',
            value: content.slice(lastIndex)
          });
        }
        
        node.children = children;
      }
    });
  };
}
