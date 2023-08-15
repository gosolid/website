const useShortcode = (html, name, callback) => {
  html =
    html &&
    html.replace(
      new RegExp(`@${name}\\((\\s*[^,)]+\\s*,)*(\\s*[^,)]+\\s*)\\)`, 'ig'),
      (...groups) => {
        groups = groups
          .slice(1, groups.length - 2)
          .filter(x => !!x)
          .map(group => {
            return group
              .replace(/,$/, '')
              .trim()
              .replace(/<\/?[^>]+>/g, '');
          });

        return callback(...groups);
      }
    );
  return html;
};

export { useShortcode };
