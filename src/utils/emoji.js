import _emoji from 'apple-color-emoji-catalina-10155';

_emoji.basePath = '/';

export const emoji = html => {
  return _emoji.replace(html).replace(/\ufe0f/g, '');
};
