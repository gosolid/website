var links = Array.from(document.querySelectorAll('a[href]'));
links.forEach(function (link) {
  if (!/#.+/.test(link.href)) {
    link.href = link.href.replace(
      /^http:\/\/serve:8000/,
      'https://gosolid.dev'
    );
  }
});
