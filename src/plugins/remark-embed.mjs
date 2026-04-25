import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

export function remarkEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      const regex = /@@(.+?)@@/g;
      
      // We'll iterate through children and find matches
      // This is a bit tricky with mixed nodes (text and links)
      // So we'll convert the whole paragraph to a string and check for matches
      const content = toString(node);
      
      if (regex.test(content)) {
        // If we found matches, we'll transform the whole paragraph into HTML nodes
        // This is the most reliable way to handle mixed content with embeds
        const children = [];
        let lastIndex = 0;
        
        content.replace(regex, (match, url, offset) => {
          // Add text before the match
          if (offset > lastIndex) {
            children.push({
              type: 'html',
              value: content.slice(lastIndex, offset)
            });
          }
          
          // Create the embed HTML
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
          
          children.push({
            type: 'html',
            value: html
          });
          
          lastIndex = offset + match.length;
        });
        
        // Add remaining text
        if (lastIndex < content.length) {
          children.push({
            type: 'html',
            value: content.slice(lastIndex)
          });
        }
        
        // Update the node
        node.children = children;
      }
    });
  };
}
