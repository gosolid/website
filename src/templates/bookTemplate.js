import React from 'react';
import '../styles/site.global.scss';
import CryptoJS from 'crypto-js';
import { Analytics } from '../components/Analytics';
import { graphql } from 'gatsby';
import Helmet from 'react-helmet';
import { Header } from '../components/Header';
import DiaryTemplate from './diaryTemplate';
import { categoryFromSlug, flattenedCategories } from '../utils/selectCategory';
import { decode } from 'html-entities';
import * as styles from './bookTemplate.module.scss';
import classNames from 'classnames/bind';
import { useEffect } from 'react';
import { emoji } from '../utils/emoji';

const cx = classNames.bind(styles);

let finished = false;

if (typeof window !== 'undefined') {
  window.docraptorJavaScriptFinished = () => finished;
}

const processCategory = categoryPage => {
  const categorySlug = categoryPage.fields.slug
    .replace(/^\/category\//, '')
    .replace(/\/$/, '');

  const category = categoryFromSlug(categorySlug);

  if (!category) {
    return;
  }

  return Object.assign({}, categoryPage, {
    frontmatter: Object.assign({}, categoryPage.frontmatter, {
      title: categoryPage.frontmatter.title || category.name,
    }),
    category,
  });
};
const processPost = post => {
  return post;
};

const decryptPost = post => {
  if (post.fields.encrypted) {
    const html = CryptoJS.AES.decrypt(
      post.html,
      post.frontmatter.password
    ).toString(CryptoJS.enc.Utf8);
    post = Object.assign({}, post, {
      html,
      frontmatter: Object.assign({}, post.frontmatter, {
        password: '',
      }),
      fields: Object.assign({}, post.fields, {
        encrypted: false,
        hasDecrypted: true,
      }),
    });
  }

  return post;
};

const processPosts = (posts, book) => {
  const categories = [];
  const entries = [];

  const out = [];

  const seen = new Set();

  posts.forEach(({ node }) => {
    if (!book.encrypted && node.fields.encrypted) {
      return;
    }

    if (['post', 'page'].includes(node.frontmatter.type)) {
      entries.push(decryptPost(processPost(node)));
    } else if (node.frontmatter.type === 'category') {
      const category = processCategory(node);
      if (category) {
        categories.push(decryptPost(category));
      }
    }
  });

  const getCategory = (
    categorySlug,
    categoryOptions,
    filter = {},
    seen = new Set()
  ) => {
    const out = [];

    const category = categoryFromSlug(categorySlug);

    if (!category) {
      console.warn('cannot find category', categorySlug);
      return [];
    }

    if (category.print === false) {
      return [];
    }

    const childCategories = flattenedCategories.filter(
      ({ parent }) => category.slug == parent
    );

    let categoryPage = categories.find(
      ({ category: { slug } = {} }) => slug === category.slug
    );

    if (!categoryPage) {
      categoryPage = {
        html: '',
        excerpt: '',
        frontmatter: {
          title: category.name,
          type: 'category',
        },
        fields: {
          encrypted: false,
          slug: `/${category.slug}/`,
        },
      };
    }

    const categoryEntries = entries
      .filter(({ frontmatter: { categories } }) =>
        (categories || []).includes(category.slug)
      )
      .filter(({ frontmatter: { bookPin, isoDate: date } }) => {
        if (!date) {
          return false;
        }

        date = new Date(date);
        if (filter.from) {
          if (!(categoryOptions.bookPins && bookPin)) {
            if (date.getTime() < new Date(filter.from).getTime()) {
              return false;
            }
          }
        }
        if (filter.to) {
          if (date.getTime() >= new Date(filter.to).getTime()) {
            return false;
          }
        }

        return true;
      });

    const getChildCategories = category => [
      category,
      ...flattenedCategories
        .filter(({ parent }) => parent === category)
        .map(({ slug }) => getChildCategories(slug))
        .reduce((a, b) => [...a, ...b], []),
    ];

    const exclude = Array.from(
      new Set(
        book.exclude
          ?.map(({ slug }) => getChildCategories(slug))
          .reduce((a, b) => [...a, ...b], []) ?? []
      )
    );

    categoryEntries.sort((a, b) => {
      if (a.frontmatter.order !== null && b.frontmatter.order !== null) {
        return a.order - b.order;
      }

      if (a.frontmatter.order !== null && b.frontmatter.order === null) {
        return -1;
      }

      if (a.frontmatter.order === null && typeof b.frontmatter.order !== null) {
        return 1;
      }

      return (
        new Date(b.frontmatter.isoDate).getTime() -
        new Date(a.frontmatter.isoDate).getTime()
      );
    });

    let first = true;
    for (const entry of categoryEntries) {
      if (seen.has(entry.fields.slug)) {
        continue;
      }

      let doExclude = false;
      for (const c of entry.frontmatter.categories) {
        if (exclude.includes(c)) {
          doExclude = true;
          break;
        }
      }

      doExclude |= categoryOptions.authors
        ? !categoryOptions.authors?.reduce(
            (a, b) => a || entry.frontmatter.author?.toLowerCase().trim() === b,
            false
          )
        : false;

      if (doExclude) {
        continue;
      }

      let pageBreak = first
        ? book.pageBreaks ?? 'right'
        : categoryOptions.pageBreak ?? entry.frontmatter.pageBreak ?? 'always';

      pageBreak =
        pageBreak === 'left'
          ? 'right'
          : pageBreak === 'right'
          ? 'left'
          : pageBreak;

      seen.add(entry.fields.slug);
      out.push(
        Object.assign({}, entry, {
          pageBreak,
          contents: true,
        })
      );
      first = false;
    }

    if (category.subcategories) {
      for (const childCategory of childCategories) {
        out.push(
          ...getCategory(
            childCategory.slug,
            {
              ...categoryOptions,
              bookPins: category.bookPins || childCategory.bookPins,
              section: false,
            },
            filter,
            seen
          )
        );
      }
    }

    if (out.length) {
      out.unshift(
        Object.assign({}, categoryPage, {
          fields: Object.assign({}, categoryPage.fields, {
            slug: `/${category.slug.replace(/\/$/, '')}/`,
          }),
          category,
          section: categoryOptions.section,
          contents: true,
        })
      );
    }

    return out;
  };

  for (const leading of book.leading ?? []) {
    const entry = entries.find(({ fields: { slug } }) => leading === slug);
    if (!entry) {
      continue;
    }

    let pageBreak = entry.frontmatter.pageBreak ?? 'always';

    pageBreak =
      pageBreak === 'left'
        ? 'right'
        : pageBreak === 'right'
        ? 'left'
        : pageBreak;

    out.push(
      Object.assign({}, entry, {
        pageBreak,
        contents: false,
        leading: true,
      })
    );
  }

  for (const category of book.categories) {
    if (category.independent) {
      out.push(
        ...getCategory(
          category.slug,
          { ...category, section: true },
          book.filter
        )
      );
    } else {
      out.push(
        ...getCategory(
          category.slug,
          { ...category, section: true },
          book.filter,
          seen
        )
      );
    }
  }

  for (const trailing of book.trailing ?? []) {
    const entry = entries.find(({ fields: { slug } }) => trailing === slug);
    if (!entry) {
      continue;
    }

    let pageBreak = entry.frontmatter.pageBreak ?? 'always';

    pageBreak =
      pageBreak === 'left'
        ? 'right'
        : pageBreak === 'right'
        ? 'left'
        : pageBreak;

    out.push(
      Object.assign({}, entry, {
        pageBreak,
        contents: false,
      })
    );
  }

  let i = 1;

  return out
    .filter(x => !!x)
    .map((post, i) => {
      const pageBreak =
        post.pageBreak ??
        (post.category
          ? (book.pageBreaks === 'left'
              ? 'right'
              : book.pageBreaks === 'right'
              ? 'left'
              : book.pageBreaks) ?? 'left'
          : 'always');
      post = Object.assign({}, post, {
        key: `${post.fields.slug}-${i++}`,
        pageBreak,
      });
      return post;
    });
};

const TableOfContents = ({ posts }) => {
  const renderCategory = (post, posts, category) => (
    <div
      className={cx('tocCategory', {
        category: !!post.category,
        section: !!post.section,
      })}
      key={post.fields.slug}
    >
      <div className={cx('toc')}>
        <a className={cx('pageNumber')} href={`#${post.key}`}>
          <span
            className={cx('title')}
            dangerouslySetInnerHTML={{
              __html: emoji(decode(post.frontmatter.title)),
            }}
          />
        </a>
      </div>
      {render(posts, category)}
    </div>
  );

  const renderPost = post => (
    <div className={cx('toc')} key={post.fields.slug}>
      <a href={`#${post.key}`} className={cx('pageNumber')}>
        <span
          className={cx('title')}
          dangerouslySetInnerHTML={{
            __html: emoji(decode(post.frontmatter.title)),
          }}
        />
      </a>
    </div>
  );

  const render = (posts, category = null) => {
    posts = posts.filter(post => post.contents);

    let out = [];

    for (const post of posts) {
      if (
        post.category &&
        ((category === null && !!post.section) ||
          post.category.parent === category?.slug)
      ) {
        let categoryPosts = posts.slice(posts.indexOf(post) + 1);
        const categoryEnd = categoryPosts.findIndex(
          _post =>
            !!_post.category && _post.category.parent !== post.category.slug
        );
        if (categoryEnd !== -1) {
          categoryPosts = categoryPosts.slice(0, categoryEnd);
        }
        out.push(renderCategory(post, categoryPosts, post.category));
      } else if (
        category &&
        post.frontmatter.categories.includes(category.slug)
      ) {
        out.push(renderPost(post));
      }
    }

    return <>{out}</>;
  };

  return (
    <>
      <h1>Contents</h1>
      <div className={cx('tocWrapper')}>{render(posts)}</div>
    </>
  );
};

const BookTemplate = ({ pageContext: { book }, data }) => {
  const { allMarkdownRemark } = data;
  const posts = processPosts(allMarkdownRemark.edges, book);

  useEffect(() => {
    const timeout = setTimeout(() => {
      finished = true;
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={cx('pageWrapper')}>
      <Analytics />
      <Helmet title={book.title} />
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .noprint {
            display: none !important;
          }

          .onlyprint {
            display: block;
          }

          :root {
            --print-page-breaks: ${
              (book.pageBreaks === 'left'
                ? 'right'
                : book.pageBreaks === 'right'
                ? 'left'
                : book.pageBreaks) ?? 'left'
            };

            ${
              book.colors?.primary
                ? `--color-primary: ${book.colors.primary};`
                : ''
            }

            ${
              book.fonts?.primary
                ? `--font-primary: ${JSON.stringify(book.fonts.primary)};`
                : ''
            }
            ${
              book.fonts?.ui
                ? `--font-ui: ${JSON.stringify(book.fonts.ui)};`
                : ''
            }
            ${
              book.fonts?.back
                ? `--font-book-back: ${JSON.stringify(book.fonts.back)};`
                : ''
            }
          }

          @media print {
            :root {
              ${
                book.margins?.left
                  ? `--print-margins-left: ${book.margins.left};`
                  : '--print-margins-left: 0.5in 1in 0.9in 0.5in;'
              }

              ${
                book.margins?.right
                  ? `--print-margins-right: ${book.margins.right};`
                  : '--print-margins-right: 0.5in 0.5in 0.9in 1in;'
              }
              
              ${
                book.colors?.primary
                  ? `--color-primary: ${book.colors.primary};`
                  : ''
              }

              ${
                book.fonts?.primary
                  ? `--font-primary: ${JSON.stringify(book.fonts.primary)};`
                  : ''
              }
              ${
                book.fonts?.ui
                  ? `--font-ui: ${JSON.stringify(book.fonts.ui)};`
                  : ''
              }
              ${
                book.fonts?.back
                  ? `--font-book-back: ${JSON.stringify(book.fonts.back)};`
                  : ''
              }
            }
          }
        `,
        }}
      />
      <Header className={cx('header')} />
      <div className={cx('toolbar')}>
        <a
          href={`https://gosolid.dev${book.slug.replace(/\/$/, '')}?force=true`}
          target="_blank"
        >
          Recreate
        </a>
        <a
          href={`https://gosolid.dev${book.slug.replace(/\/$/, '')}?test=true`}
          target="_blank"
        >
          Test
        </a>
      </div>
      <div className="book-content">
        {posts
          .filter(({ leading }) => !!leading)
          .map((post, i) => (
            <div className={cx('page', { firstPage: i === 0 })} key={`${i}`}>
              <DiaryTemplate
                data={{
                  markdownRemark: {
                    ...post,
                    pageBreak: i === 0 ? 'auto' : post.pageBreak,
                  },
                }}
                includeMeta={false}
                includeBacklinks={false}
                pageBreakBefore={true}
              />
            </div>
          ))}
        <div
          className={cx('page', 'tocPage', {
            firstPage: posts.filter(({ leading }) => !!leading).length === 0,
          })}
        >
          <TableOfContents posts={posts} />
        </div>
        {posts
          .filter(({ leading }) => !leading)
          .map((post, i) => (
            <div className={cx('page')} key={`${i}`}>
              <DiaryTemplate
                data={{ markdownRemark: post }}
                includeMeta={false}
                includeBacklinks={false}
                pageBreakBefore={true}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

const pageQuery = graphql`
  query {
    allMarkdownRemark(
      sort: { order: [ASC], fields: [frontmatter___date] }
      filter: { frontmatter: { type: { in: ["post", "category", "page"] } } }
      limit: 20000
    ) {
      edges {
        node {
          html
          excerpt(pruneLength: 400)
          frontmatter {
            dateString: date
            isoDate: date(formatString: "YYYY-MM-DDTHH:mm:ssZ")
            date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
            order
            title
            author
            location
            showTitle
            url
            categories
            twitter
            facebook
            type
            backgroundColor
            color
            showLink
            pageBreak
            bookPin
            password
          }
          fields {
            encrypted
            slug
          }
        }
      }
    }
  }
`;

export default BookTemplate;

export { pageQuery };
