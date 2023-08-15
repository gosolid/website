const categories = require('../../content/categories.json');

exports.flattenCategories = (categories, parent = null, out = []) => {
  categories.forEach(category => {
    out.push({
      name: category.name,
      slug: category.slug,
      href: category.href,
      sort: category.sort ?? 'asc',
      default: !!category.default,
      ignore: !!category.ignore,
      print: category.print ?? true,
      bookPins: !!category.bookPins,
      subcategories: category.subcategories ?? true,
      showEmpty: category.showEmpty ?? true,
      showChildren: category.showChildren ?? true,
      parent,
    });

    if (category.children) {
      exports.flattenCategories(category.children, category.slug, out);
    }
  });

  return out;
};

exports.flattenedCategories = exports.flattenCategories(categories);
