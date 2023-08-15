import React from 'react';
import path from 'path';
import { useShortcodes } from './src/hooks/useShortcodes';
import { ImportProvider } from './src/hooks/useShortcodes/useImports';
import { renderToString } from 'react-dom/server';
import { flattenedCategories } from './src/utils/categories';

const SITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://gosolid.dev'
    : `http://localhost:8000`;

const prepareExcerpt = excerpt => excerpt?.replace(/@\w+\([^)]+\)/g, '');

const renderPost = (post, { site, imports }) => {
  const Post = ({ post }) => {
    const html = useShortcodes(post.html);

    return (
      <>
        <article dangerouslySetInnerHTML={{ __html: html }} />
      </>
    );
  };

  const element = (
    <ImportProvider imports={imports}>
      <Post post={post} />
    </ImportProvider>
  );

  let html = renderToString(element);

  html = html.replace(/src="\//g, `src="${site.siteMetadata.siteUrl}/`);
  html = html.replace(/href="\//g, `href="${site.siteMetadata.siteUrl}/`);

  return html;
};

const categoryFeed = (mainCategory, ...categories) => ({
  serialize: ({ query: { imports, site, allMarkdownRemark } }) => {
    categories = [
      ...new Set(
        [mainCategory, ...categories]
          .map(category =>
            flattenedCategories.find(({ slug }) => category === slug)
          )
          .reduce(
            (a, category) => [
              ...a,
              ...(() => {
                const findDescendantCategories = category => {
                  return [
                    category,
                    ...flattenedCategories
                      .filter(c => c.parent === category.slug)
                      .map(c => findDescendantCategories(c))
                      .reduce((a, b) => [...a, ...b], []),
                  ];
                };
                return category.subcategories
                  ? findDescendantCategories(category)
                  : [category];
              })(),
            ],
            []
          )
          .map(category => category.slug)
      ),
    ];

    return allMarkdownRemark.edges
      .filter(({ node }) =>
        (node.frontmatter.categories ?? []).reduce(
          (a, b) => a || categories.includes(b),
          false
        )
      )
      .map(edge => {
        return Object.assign(
          {},
          {
            title: edge.node.frontmatter.title,
            date: edge.node.frontmatter.date,
            description: prepareExcerpt(edge.node.excerpt),
            url: site.siteMetadata.siteUrl + edge.node.fields.slug,
            guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
            custom_elements: [
              {
                'content:encoded': renderPost(edge.node, {
                  site,
                  imports,
                }),
              },
            ],
          }
        );
      });
  },

  query: `
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] },
        filter: { frontmatter: { type: { in: ["post"] }, show: { ne: false } }, fields: { encrypted: { ne: true } } }
      ) {
        edges {
          node {
            excerpt
            html
            fields { slug }
            frontmatter {
              title
              date
              categories
            }
          }
        }
      }
    }
  `,
  output: `/rss/${mainCategory}.xml`,
  title: flattenedCategories.find(({ slug }) => slug === mainCategory).name,
  link: `${SITE_URL}/rss/${mainCategory}.xml`,
  icon: 'https://gosolid.dev/avatars/tim-bw.jpeg',
});

module.exports = {
  flags: { DEV_SSR: true },
  siteMetadata: {
    title: 'Solid',
    siteUrl: SITE_URL,
  },
  trailingSlash: 'always',
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Solid',
        short_name: 'Solid',
        start_url: '/',
        background_color: 'white',
        theme_color: '#eee',
        display: 'standalone',
        icon: 'static/icons/solid.png',
        icon_options: {
          purpose: 'any maskable',
        },
        legacy: false,
        include_favicon: false,
        cache_busting_mode: 'none',
      },
    },
    // 'gatsby-plugin-remove-serviceworker',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-static-folders',
      options: {
        folders: [
          path.relative(
            __dirname,
            path.resolve(
              path.dirname(
                require.resolve('apple-color-emoji-catalina-10155/package.json')
              ),
              'images'
            )
          ),
        ],
      },
    },
    'gatsby-plugin-gatsby-cloud',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-svgr',
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        cssLoaderOptions: {
          camelCase: true,
        },
        implementation: require('node-sass'),
        sassRuleTest: /\.global\.s(a|c)ss$/,
        sassRuleModulesTest: /\.module\.s(a|c)ss$/,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/images/icon.png',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'markdown-pages',
        path: 'content',
      },
      __key: 'pages',
    },
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-vscode`,
            options: {
              theme: 'Light+ (default light)',
            },
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 4096,
              withWebp: true,
              loading: 'eager',
              decoding: 'sync',
              tracedSVG: false,
              quality: 60,
            },
          },
          {
            resolve: 'gatsby-remark-audio',
            options: {
              preload: 'auto',
              loop: false,
              controls: true,
              muted: false,
              autoplay: false,
            },
          },
          'gatsby-remark-copy-linked-files',
        ],
      },
    },
    'gatsby-plugin-image',
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
            imports: allMarkdownRemark(
              filter: { frontmatter: { type: { eq: "import" } } }
            ) {
              edges {
                node {
                  html
                  fields {
                    slug
                  }
                }
              }
            }
          }
        `,
        feeds: [categoryFeed('blog'), categoryFeed('docs')],
      },
    },
    // {
    //   resolve: 'gatsby-plugin-offline',
    //   options: {
    //     precachePages: ['/**/*.html', '/**/*.js', '/**/*.webp'],
    //     excludePages: ['/books/*/**'],
    //     debug: true,
    //   },
    // },
    'gatsby-plugin-remove-serviceworker',
  ],
};
