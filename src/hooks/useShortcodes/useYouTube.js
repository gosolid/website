import { useShortcode } from './useShortcode';
import './useYouTube.global.scss';

const useYouTube = html =>
  useShortcode(html, 'youtube', (url, orientation = 'portrait') => {
    const html = `
      <div class="youtube youtube-${orientation}">
        <div>
        <iframe
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen=""
          frameborder="0"
          loading="lazy"
          width="100%"
          height="100%"
          src="${url.replace(
            /^https:\/\/youtu.be\//,
            'https://www.youtube.com/embed/'
          )}"
        ></iframe>
        </div>
      </div>
    `;
    return html.trim().replace(/\s+/g, ' ');
  });

export { useYouTube };
