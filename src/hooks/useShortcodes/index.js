import { useImports } from './useImports';
import { useYouTube } from './useYouTube';
import { useSpotify } from './useSpotify';
import { useSoundcloud } from './useSoundcloud';

const shortcodes = [useImports, useYouTube, useSpotify, useSoundcloud];

const useShortcodes = html => {
  while (
    new RegExp(`@[\\w-_]+\\((\\s*[^,)]+\\s*,)*(\\s*[^,)]+\\s*)\\)`, 'ig').test(
      html
    )
  ) {
    for (const shortcode of shortcodes) {
      html = shortcode(html);
    }
  }

  return html;
};

export { useShortcodes };
