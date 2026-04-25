import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

export function remarkEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      // Get the full text content of the paragraph
      const text = toString(node);
      const regex = /@@(.+?)@@/g;

      if (regex.test(text)) {
        // Reset regex index
        regex.lastIndex = 0;
        
        const newChildren = [];
        let currentText = '';
        
        // This is a simplified approach: if a paragraph ONLY contains the embed, replace it
        // If it contains other text, we'll need a more complex replacement
        // For now, let's handle the case where the embed is on its own line/paragraph
        if (text.startsWith('@@') && text.endsWith('@@')) {
          const url = text.slice(2, -2);
          let html = '';
          
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

          node.type = 'html';
          node.value = html;
          node.children = [];
        }
      }
    });
  };
}
