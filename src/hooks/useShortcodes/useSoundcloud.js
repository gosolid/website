import { useShortcode } from './useShortcode';
import './useSoundcloud.global.scss';

const useSoundcloud = html =>
  useShortcode(html, 'soundcloud', url => {
    const html = `
      <div class="soundcloud">
        <iframe
          style="border-radius: 12px"
          src="https://w.soundcloud.com/player/?url=${encodeURIComponent(
            url
          )}&color=%239246da&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true'"
          width="100%"
          height="300"
          frameBorder="0"
          allowfullscreen=""
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    `;
    return html.trim().replace(/\s+/g, ' ');
  });

export { useSoundcloud };
