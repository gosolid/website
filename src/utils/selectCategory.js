import { flattenedCategories } from '../components/Header';

const categoryFromSlug = slug =>
  flattenedCategories.find(category => category.slug === slug);

const selectCategory = (slug, targetCategories) => {
  let categories = flattenedCategories.filter(category =>
    targetCategories.includes(category.slug)
  );

  categories = categories.filter(
    c1 => !c1.ignore && !categories.find(c2 => c2.parent === c1.slug)
  );

  categories.sort(
    (a, b) =>
      flattenedCategories.findIndex(c => c.slug === a.slug) -
      flattenedCategories.findIndex(c => c.slug === b.slug)
  );

  return categories;
};

export { selectCategory, categoryFromSlug, flattenedCategories };
