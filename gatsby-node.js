const path = require('path');
const moment = require('moment');
const {
  createFilePath,
  createRemoteFileNode,
} = require(`gatsby-source-filesystem`);
const categories = require('./content/categories.json');
const { books } = require('./content/books.json');
const {
  flattenedCategories: _flattenedCategories,
} = require('./src/utils/categories');
const { execSync, spawn } = require('child_process');
const { writeFileSync } = require('fs');

if (process.env.NODE_ENV !== 'production') {
  Object.assign(process.env, {
    SHOW_ALL_POSTS: 'true',
  });
}

exports.createPages = async ({
  actions,
  graphql,
  reporter,
  getCache,
  createNodeId,
}) => {
  const { createPage, createNode } = actions;

  const diaryPostTemplate = require.resolve('./src/templates/diaryTemplate');
  const categoryPostTemplate = require.resolve(
    './src/templates/categoryTemplate'
  );
  const bookPostTemplate = require.resolve('./src/templates/bookTemplate');
  const bookCoverPostTemplate = require.resolve(
    './src/templates/bookCoverTemplate'
  );

  const pages = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { type: { eq: "page" } } }
        limit: 100000
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              title
              backlink
              hero
            }
          }
        }
      }
    }
  `);

  const posts = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { type: { eq: "post" } } }
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 100000
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              title
              categories
              date
              hero
            }
          }
          next {
            fields {
              slug
              encrypted
            }
            frontmatter {
              title
            }
          }
          previous {
            fields {
              slug
              encrypted
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `);

  if (pages.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.');
    return;
  }

  await Promise.all(
    pages.data.allMarkdownRemark.edges.map(async ({ node }) => {
      if (node.fields.slug == '/index/') {
        return;
      }

      let backlink = node.frontmatter.backlink;
      if (backlink) {
        if (!backlink.endsWith('/')) {
          backlink = `${backlink}/`;
        }
        backlink =
          pages.data.allMarkdownRemark.edges.find(({ node }) =>
            [backlink, `${backlink}index/`].includes(node.fields.slug)
          )?.node ||
          posts.data.allMarkdownRemark.edges.find(({ node }) =>
            [backlink, `${backlink}index/`].includes(node.fields.slug)
          )?.node;
      }

      createPage({
        path: node.fields.slug,
        component: diaryPostTemplate,
        context: {
          slug: node.fields.slug,
          backlink,
        },
        fields: {},
      });
    })
  );

  if (posts.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.');
    return;
  }

  const categoryPages = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { type: { eq: "category" } } }
        limit: 100000
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  const { allMarkdownRemark } = posts.data;

  for (const book of books) {
    createPage({
      path: `/books/${book.id}/`,
      component: bookPostTemplate,
      context: {
        book,
      },
    });
    createPage({
      path: `/books/${book.id}-cover/`,
      component: bookCoverPostTemplate,
      context: {
        book,
        frontSlug: book.slug,
        backSlug: book.back,
      },
    });
  }

  allMarkdownRemark.edges.forEach(({ node, next, previous }) => {
    createPage({
      path: node.fields.slug,
      component: diaryPostTemplate,
      context: {
        slug: node.fields.slug,
      },
    });
  });

  const addNationsToCategories = categories => {
    categories = categories.slice();

    return categories;
  };

  const flattenedCategories = addNationsToCategories(_flattenedCategories);

  flattenedCategories
    .filter(category => {
      return (
        !pages.data.allMarkdownRemark.edges.find(edge => {
          return (
            edge.node.fields.slug === `/${category.slug}/index/` ||
            edge.node.fields.slug === `/${category.slug}/`
          );
        }) &&
        !posts.data.allMarkdownRemark.edges.find(edge => {
          return (
            edge.node.fields.slug === `/${category.slug}/index/` ||
            edge.node.fields.slug === `/${category.slug}/`
          );
        })
      );
    })
    .forEach(category => {
      const findDescendantCategories = category => {
        return [
          category,
          ...flattenedCategories
            .filter(c => c.parent === category.slug)
            .map(c => findDescendantCategories(c))
            .reduce((a, b) => [...a, ...b], []),
        ];
      };
      const parentCategories = flattenedCategories
        .filter(c => c.slug === category.slug)
        .map(c => flattenedCategories.find(c2 => c2.slug === c.parent))
        .filter(x => !!x);
      const childCategories = flattenedCategories.filter(
        c => c.parent === category.slug
      );
      const categories = category.subcategories
        ? findDescendantCategories(category)
        : [category];

      const posts = allMarkdownRemark.edges.filter(({ node }) => {
        return categories.reduce(
          (a, b) => a || node.frontmatter.categories?.includes(b.slug),
          false
        );
      });

      const postsPerPage = 4000;
      const numPages = Math.ceil(posts.length / postsPerPage) || 1;
      const categoryPage =
        categoryPages.data.allMarkdownRemark.edges.filter(({ node }) => {
          return node.fields.slug === `/category/${category.slug}/`;
        })[0] ??
        categoryPages.data.allMarkdownRemark.edges.filter(({ node }) => {
          return node.fields.slug === `/category/default/`;
        })[0];

      if (category?.sort === 'asc') {
        posts.sort(({ node: n1 }, { node: n2 }) => {
          const d1 = n1.frontmatter.date;
          const d2 = n2.frontmatter.date;

          if (d1 < d2) {
            return -1;
          }

          if (d1 > d2) {
            return 1;
          }

          return 0;
        });
      }

      Array.from({ length: numPages }).forEach((_, i) => {
        const pagePosts = posts.slice(i * postsPerPage, (i + 1) * postsPerPage);

        let component = categoryPostTemplate;
        let extraProps = {};

        createPage({
          path:
            i === 0
              ? category.default
                ? '/'
                : `${category.slug}`
              : `${category.slug}/${i + 1}`,
          component,
          context: {
            category,
            parentCategories,
            childCategories,
            numPages,
            slug: `/${category.slug}/`,
            currentPage: i + 1,
            ids: pagePosts.map(({ node }) => node.id),
            sort: category?.sort === 'asc' ? 'ASC' : 'DESC',
            categorySlug: category.slug,
            categoryPageId: i === 0 ? categoryPage?.node?.id || null : null,
            showPosts: process.env.SHOW_ALL_POSTS === 'true' ? true : false,
            ...extraProps,
          },
        });
      });
    });
};

exports.onCreateNode = async ({
  node,
  getNode,
  actions: { createNode, createNodeField },
  createNodeId,
  getCache,
}) => {
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `content` });
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });

    if (node.frontmatter.hero) {
      let hero = node.frontmatter.hero;
      if (/^https:\/\/unsplash.com\/$/i && !/\/download$/i.test(hero)) {
        hero += '/download';
      }

      const heroNode = await createRemoteFileNode({
        url: hero,
        parentNodeId: node.id,
        createNode,
        createNodeId,
        getCache,
      });

      if (heroNode) {
        createNodeField({
          node,
          name: 'hero',
          value: heroNode.id,
        });
      }
    }
  }
};

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;
  const oldPage = Object.assign({}, page);

  page.path = page.path.replace(/\/index\/$/, '/');

  if (page.path !== oldPage.path) {
    deletePage(oldPage);
    createPage(page);
  }
};

exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules'),
      ],
      fallback: {
        crypto: false,
        path: require.resolve('path-browserify'),
      },
    },
  });
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type MarkdownRemark implements Node {
      hero: File @link(from: "fields.hero")
    }

    type MarkdownRemarkFields {
      encrypted: Boolean
    }

    enum PostSize {
      normal
      large
      extraLarge
    }

    type MarkdownRemarkFrontmatter {
      order: Int
      show: Boolean\
      backlink: String
      title: String
      author: String
      location: String
      showTitle: Boolean
      url: String
      categories: [String!]
      twitter: String
      facebook: String
      type: String
      backgroundColor: String
      color: String
      showLink: Boolean
      showRead: Boolean
      pageBreak: String
      bookPin: Boolean
      pinOrder: Int
      categoryPins: [String!]
      pin: Boolean
      className: String
      hero: String
      size: PostSize
      albums: [String!]
      password: String
    }

    type SitePageContextBook {
      id: String
      title: String
      slug: String
      filter: SitePageContextBookFilter
      categories: [SitePageContextBookCategories]
      exclude: [SitePageContextBookExclude]
      back: String
      leading: [String]
      trailing: [String]
      author: String
      barcode: Boolean
      colors: SitePageContextBookColors
      fonts: SitePageContextBookFonts
      encrypted: Boolean
    }

    type SitePageContextBookFilter {
      from(
        formatString: String
        fromNow: Boolean
        difference: String
        locale: String
      ): Date

      to(
        formatString: String
        fromNow: Boolean
        difference: String
        locale: String
      ): Date
    }

    type SitePageContextBookCategories {
      slug: String
      independent: Boolean
      authors: [String]
      pageBreak: String
    }

    type SitePageContextBookExclude {
      slug: String
    }

    type SitePageContextBookColors {
      primary: String
    }

    type SitePageContextBookFonts {
      primary: String
    }
  `;
  createTypes(typeDefs);
};

exports.onPostBuild = ({ reporter, basePath, pathPrefix }) => {
  try {
    execSync('yarn build:books', { stdio: 'inherit' });
    writeFileSync(
      'public/_config.yml',
      `
include:
  - .well-known
`
    );
  } finally {
    if (process.env.CLEAN_BOOKS === 'true') {
      execSync('yarn clean:books', { stdio: 'inherit' });
    }
  }
};
