import { visit } from 'unist-util-visit';

export function remarkEmbed() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /@@(.+?)@@/g;
      const matches = node.value.match(regex);

      if (matches) {
        const children = [];
        let lastIndex = 0;

        node.value.replace(regex, (match, url, offset) => {
          // Add text before the match
          if (offset > lastIndex) {
            children.push({
              type: 'text',
              value: node.value.slice(lastIndex, offset),
            });
          }

          // Create the embed node
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
            value: html,
          });

          lastIndex = offset + match.length;
        });

        // Add remaining text
        if (lastIndex < node.value.length) {
          children.push({
            type: 'text',
            value: node.value.slice(lastIndex),
          });
        }

        // Replace the current node with the new children
        parent.children.splice(index, 1, ...children);
        return index + children.length;
      }
    });
  };
}
