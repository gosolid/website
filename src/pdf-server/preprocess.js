var findPreviousVisibleSibling = function (el) {
  while ((el = el.previousElementSibling)) {
    var box = el.getPrinceBoxes()[0];
    if (!box) {
      return el;
    }
  }

  return null;
};

var images = Array.from(
  document.querySelectorAll('.book-content .gatsby-resp-image-wrapper')
);
images.forEach(function (img) {
  var box = img.getPrinceBoxes()[0];

  if (!box) {
    return;
  }

  var page = PDF.pages[box.pageNum - 1];
  var height = box.y - (page.y - page.h) - 15;
  img.style.maxHeight = height + 'pt';
  img.className += ' prince-image';
});

var links = Array.from(document.querySelectorAll('a[href]'));
links.forEach(function (link) {
  if (!/#.+/.test(link.href)) {
    link.href = link.href.replace(
      /^http:\/\/serve:8000/,
      'https://gosolid.dev'
    );
  }
});
