import { useShortcode } from './useShortcode';
import './useSpotify.global.scss';

const useSpotify = html =>
  useShortcode(html, 'spotify', url => {
    const html = `
      <div class="spotify">
        <iframe
          style="border-radius: 12px"
          src="${url.replace(
            /^https?:\/\/open.spotify.com\/playlist\//,
            'https://open.spotify.com/embed/playlist/'
          )}"
          width="100%"
          height="380"
          frameBorder="0"
          allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    `;
    return html.trim().replace(/\s+/g, ' ');
  });

export { useSpotify };
