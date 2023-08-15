import React, { useState, useEffect, Fragment } from 'react';
import { Analytics } from '../components/Analytics';
import '../styles/site.global.scss';
import Helmet from 'react-helmet';
import { Link, graphql } from 'gatsby';
import { PostContent } from '../components/PostContent';
import { withEncryptedProvider, useEncrypted } from '../hooks/useEncrypted';
import Pagination from '@material-ui/lab/Pagination';
import PaginationItem from '@material-ui/lab/PaginationItem';
import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import LocationOnRoundedIcon from '@material-ui/icons/LocationOnRounded';
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded';
import { BsFillPinAngleFill } from 'react-icons/bs';
import { Header } from '../components/Header';
import { decode } from 'html-entities';
import { compose } from '@grexie/compose';
import { ReactComponent as LinkIcon } from '../images/link.svg';
import authors from '../../content/authors.json';
import { categoryFromSlug } from '../utils/selectCategory';
import { formatDate } from '../utils/formatDate';
import RenderIfVisible from 'react-render-if-visible';
import * as styles from './categoryTemplate.module.scss';
import classNames from 'classnames/bind';
import { Checkbox } from '../components/Checkbox';
import { emoji } from '../utils/emoji';
import { fetchAlbums } from '../utils/albums';
import { Photo } from '../components/Photo';
import moment from 'moment-timezone';
import { GatsbyImage } from 'gatsby-plugin-image';
// import { Veritas, VeritasType } from '@grexie/veritas/react';

const cx = classNames.bind(styles);

const prepareExcerpt = excerpt => excerpt?.replace(/@\w+\([^)]+\)/g, '');

const CategoryTemplate = ({
  renderBeforeContent = () => null,
  renderBeforeTitle = () => null,
  renderAfterContent = () => null,
  pageContext: {
    category,
    numPages,
    currentPage,
    slug,
    showPosts,
    childCategories,
    parentCategories,
  },
  data: { sidebar, categoryPage, pinned, categoryPinned, allMarkdownRemark },
}) => {
  const [isInitial, setInitial] = useState(true);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    setInitial(false);
  }, []);

  useEffect(() => {
    if (!categoryPage) {
      return;
    }

    if (!categoryPage.frontmatter.albums) {
      return;
    }

    fetchAlbums(categoryPage.frontmatter.albums)
      .then(albums => setAlbums(albums))
      .catch(err => console.error(err));
  }, []);

  const { decrypted } = useEncrypted();

  const [showUnread, setShowUnread] = useState(false);
  const [showAll, setShowAll] = useState(false);

  pinned = {
    edges: [...(pinned?.edges ?? []), ...(categoryPinned?.edges ?? [])],
  };
  pinned.edges.sort((a, b) => {
    if (
      Number.isInteger(a.node.frontmatter.pinOrder) &&
      !Number.isInteger(b.node.frontmatter.pinOrder)
    ) {
      return -1;
    }

    if (
      !Number.isInteger(a.node.frontmatter.pinOrder) &&
      Number.isInteger(b.node.frontmatter.pinOrder)
    ) {
      return 1;
    }

    if (
      Number.isInteger(a.node.frontmatter.pinOrder) &&
      Number.isInteger(b.node.frontmatter.pinOrder)
    ) {
      return a.node.frontmatter.pinOrder - b.node.frontmatter.pinOrder;
    }

    return (
      new Date(a.node.frontmatter.dateString).getTime() -
      new Date(b.node.frontmatter.dateString).getTime()
    );
  });

  useEffect(() => {
    setShowAll(localStorage.getItem(`${category.slug}:show-all`) === 'true');
  }, []);

  const onShowAllChanged = value => {
    setShowAll(value);
    localStorage.setItem(`${category.slug}:show-all`, value.toString());
  };

  useEffect(() => {
    setShowUnread({});
  }, []);

  const parent = categoryFromSlug(category.parent);

  const renderPost =
    ({ pinned = false } = {}) =>
    ({ node }) => {
      const author = authors[node.frontmatter.author?.toLowerCase()];
      const location = node.frontmatter.location;

      if (
        (!categoryPage?.fields?.encrypted || !decrypted) &&
        node.fields.encrypted
      ) {
        return null;
      }

      const unread =
        !!showUnread && !isInitial && typeof localStorage !== 'undefined'
          ? localStorage.getItem(node.fields.slug) !== 'read'
          : false;

      const el = (
        <li
          key={node.fields.slug}
          className={cx({
            read: !unread,
            showRead: !!node.frontmatter.showRead,
            normal: (node.frontmatter.size ?? 'normal') === 'normal',
            large: node.frontmatter.size === 'large',
            xLarge: node.frontmatter.size === 'extraLarge',
          })}
        >
          <a href={node.fields.slug} className={cx('article')}>
            {node.hero && (
              <GatsbyImage
                alt={'Image'}
                className={cx('hero')}
                image={node?.hero?.childImageSharp?.gatsbyImageData}
              />
            )}
            <div className={cx('title')}>
              <h2>
                {pinned && <BsFillPinAngleFill className={cx('pinned')} />}
                <span
                  dangerouslySetInnerHTML={{
                    __html: emoji(decode(node.frontmatter.title)),
                  }}
                />
              </h2>
              {unread && <div className={cx('unread')}>Unread</div>}
            </div>
            <div className={cx('meta')}>
              {node.frontmatter.dateString &&
                node.frontmatter.showMeta !== false && (
                  <time className={cx('date')}>
                    <CalendarTodayRoundedIcon />
                    <span>{formatDate(node.frontmatter.dateString)}</span>
                  </time>
                )}
              {location && node.frontmatter.showMeta !== false && (
                <div className={cx('location')}>
                  <LocationOnRoundedIcon />
                  <span>{location}</span>
                </div>
              )}
              {author && (
                <div className={cx('author')}>
                  <img src={author.avatar} />
                  <span>{author.name}</span>
                </div>
              )}
            </div>
            <div
              className={cx('excerpt')}
              dangerouslySetInnerHTML={{
                __html: emoji(decode(prepareExcerpt(node.excerpt))),
              }}
            />
          </a>
        </li>
      );

      return { el, date: new Date(node.frontmatter.dateString) };
    };

  const renderPhoto = photo => {
    const unread =
      !!showUnread && !isInitial && typeof localStorage !== 'undefined'
        ? localStorage.getItem(`photo-${photo.photoGuid}`) !== 'read'
        : false;

    const el = (
      <li key={photo.photoGuid} className={cx('photo')}>
        <div>
          <RenderIfVisible stayRendered={false}>
            <Photo photo={photo} />
          </RenderIfVisible>
        </div>
      </li>
    );
    return { el, date: new Date(photo.dateCreated) };
  };

  const addDays = posts => {
    let lastDate;
    const out = [];

    for (const post of posts) {
      if (
        !lastDate ||
        post.date.getFullYear() != lastDate.getFullYear() ||
        post.date.getMonth() != lastDate.getMonth() ||
        post.date.getDay() != lastDate.getDay()
      ) {
        out.push({
          date: post.date,
          el: (
            <li
              key={`date-${post.date.toISOString()}`}
              className={cx('dateHeader')}
            >
              <h1>{moment(post.date).format('ddd Do MMMM YYYY')}</h1>
            </li>
          ),
        });
        lastDate = post.date;
      }
      out.push(post);
    }

    return out;
  };

  const pinnedPosts = pinned.edges
    .map(renderPost({ pinned: true }))
    .filter(x => !!x);
  let photos = albums.reduce(
    (a, album) => [...a, ...album.photos.map(renderPhoto)],
    []
  );
  const posts = addDays(
    [
      ...photos,
      ...allMarkdownRemark.edges.map(renderPost()).filter(x => !!x),
    ].sort((a, b) =>
      category.sort === 'asc'
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime()
    )
  ).map(a => a.el);

  const hasUnread =
    !isInitial && typeof localStorage !== 'undefined'
      ? pinned.edges.reduce(
          (a, { node }) =>
            a ||
            node.frontmatter.showRead ||
            localStorage.getItem(node.fields.slug) !== 'read',
          false
        ) ||
        allMarkdownRemark.edges.reduce(
          (a, { node }) =>
            a ||
            node.frontmatter.showRead ||
            localStorage.getItem(node.fields.slug) !== 'read',
          false
        )
      : false;

  const countRead =
    !isInitial && typeof localStorage !== 'undefined'
      ? pinned.edges.reduce(
          (a, { node }) =>
            a +
            (!node.frontmatter.showRead &&
            localStorage.getItem(node.fields.slug) === 'read'
              ? 1
              : 0),
          0
        ) +
        allMarkdownRemark.edges.reduce(
          (a, { node }) =>
            a +
            (!node.frontmatter.showRead &&
            localStorage.getItem(node.fields.slug) === 'read'
              ? 1
              : 0),
          0
        )
      : 0;

  const excerpt =
    (decrypted ? prepareExcerpt(categoryPage?.excerpt) : null) ?? null;

  const markAllRead = () => {
    pinned.edges.forEach(({ node }) => {
      localStorage.setItem(node.fields.slug, 'read');
    });
    allMarkdownRemark.edges.forEach(({ node }) => {
      localStorage.setItem(node.fields.slug, 'read');
    });
    setShowUnread({});
  };
  const markAllUnread = () => {
    pinned.edges.forEach(({ node }) => {
      localStorage.removeItem(node.fields.slug);
    });
    allMarkdownRemark.edges.forEach(({ node }) => {
      localStorage.removeItem(node.fields.slug);
    });
    setShowUnread({});
  };
  return (
    <div className={cx('container')}>
      <Analytics />
      <Helmet
        title={`${
          category.default
            ? ''
            : `${
                decrypted
                  ? categoryPage?.frontmatter?.title || category.name
                  : 'Private'
              } | `
        }Solid`}
      >
        <link
          rel="canonical"
          href={categoryPage?.frontmatter?.url ?? `https://gosolid.dev${slug}`}
        />
        <meta
          name="twitter:title"
          content={
            decrypted
              ? categoryPage?.frontmatter?.title || category.name
              : 'Private encrypted topic for Solid'
          }
        />
        <meta
          name="twitter:description"
          content={decrypted && excerpt ? excerpt : 'Solid'}
        />
        <meta
          name="og:url"
          content={
            categoryPage?.frontmatter?.url ?? `https://gosolid.dev${slug}`
          }
        />
        <meta
          name="og:title"
          content={
            decrypted
              ? categoryPage?.frontmatter?.title || category.name
              : 'Private encrypted topic for Solid'
          }
        />
        <meta
          name="og:description"
          content={decrypted && excerpt ? excerpt : 'Solid.'}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <Header
        twitter={categoryPage?.twitter}
        facebook={categoryPage?.facebook}
        disableAnalytics={!(categoryPage?.analytics ?? true)}
        className={categoryPage?.frontmatter?.className}
      />
      <div
        className={cx('page', categoryPage?.frontmatter?.className, {
          encrypted: categoryPage?.fields?.encrypted,
          decrypted,
          showAll: !!showAll,
          showEmpty: !!category?.showEmpty,
          empty: pinnedPosts.length === 0 && posts.length === 0,
        })}
      >
        <div className={cx('wrapper')}>
          {decrypted && (
            <div className={cx('pagenav')}>
              {parentCategories.map((parent, i) => (
                <a
                  href={parent.default ? '/' : `/${parent.slug}/`}
                  key={parent.slug}
                >
                  {i == 0 && <ChevronLeftRoundedIcon />}
                  <span>{parent.name}</span>
                </a>
              ))}
            </div>
          )}
          {(!decrypted || (categoryPage?.frontmatter?.showTitle ?? true)) && (
            <h1 className={cx('heading')}>
              {renderBeforeTitle()}
              <span
                dangerouslySetInnerHTML={{
                  __html: decrypted
                    ? emoji(
                        decode(
                          categoryPage?.frontmatter?.title || category.name
                        )
                      )
                    : 'Private',
                }}
              />
            </h1>
          )}
          {decrypted && categoryPage?.frontmatter?.showMeta !== false && (
            <>
              <div className={cx('meta')}>
                {categoryPage?.frontmatter?.dateString && (
                  <time className={cx('date')}>
                    <CalendarTodayRoundedIcon />
                    <span>
                      {formatDate(categoryPage?.frontmatter?.dateString)}
                    </span>
                  </time>
                )}
              </div>
              <div className={cx('meta')}>
                <a
                  className={cx('url')}
                  href={
                    categoryPage?.frontmatter?.url ??
                    `https://gosolid.dev${slug}`
                  }
                >
                  <LinkIcon />
                  <span>
                    {categoryPage?.frontmatter?.url ??
                      `https://gosolid.dev${slug}`}
                  </span>
                </a>
              </div>
            </>
          )}
          {renderBeforeContent()}
          {!!categoryPage && (
            <>
              <PostContent
                html={categoryPage.html}
                encrypted={categoryPage.fields.encrypted}
              />
            </>
          )}
          {renderAfterContent()}
          {decrypted && <hr className={cx('divider')} />}
          <div className={cx('sidebar', 'mobileSidebar')}>
            {category.showChildren && !!childCategories.length && (
              <>
                <h3>Subcategories</h3>
                <ul>
                  {childCategories.map(c => (
                    <li key={c.slug}>
                      <a href={`/${c.slug}/`}>{c.name}</a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <span dangerouslySetInnerHTML={{ __html: sidebar?.html }} />
          </div>
          {decrypted && (
            <>
              <div className={cx('toolbar')}>
                <button onClick={markAllRead}>Mark all as Read</button>
                <button onClick={markAllUnread}>Mark all as Unread</button>
                <div className={cx('flexBreak')} />
                <Checkbox
                  id="show-all"
                  className={cx('showAll')}
                  checkedClassName={cx('checked')}
                  value={showAll}
                  onChange={onShowAllChanged}
                >
                  Show All Posts
                </Checkbox>
              </div>
              <ul
                className={cx('articles')}
                style={{
                  marginBottom:
                    !showAll && countRead > 0 && hasUnread ? '3em' : undefined,
                }}
              >
                {pinnedPosts.length === 0 && posts.length === 0 && (
                  <li className={cx('noPosts')}>
                    There are no posts in this chapter yet.
                  </li>
                )}
                {pinnedPosts}
                {posts}
              </ul>
              {!showAll && countRead > 0 && (
                <div className={cx('noposts')}>
                  <p>
                    There are {countRead} posts which you have already read.
                  </p>
                  <p>
                    <a onClick={() => onShowAllChanged(true)}>Click here</a> to
                    read them again.
                  </p>
                </div>
              )}
              {numPages > 1 && (
                <div className={cx('pagination')}>
                  <Pagination
                    count={numPages}
                    page={currentPage}
                    shape="rounded"
                    renderItem={item => (
                      <PaginationItem
                        component={Link}
                        to={
                          item.page === 1 && category.default
                            ? '/'
                            : `/${category.slug}${
                                item.page === 1 ? '/' : `/${item.page}/`
                              }`
                        }
                        {...item}
                      />
                    )}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className={cx('sidebar')}>
        {category.showChildren && !!childCategories.length && (
          <>
            <h3>Subcategories</h3>
            <ul>
              {childCategories.map(c => (
                <li key={c.slug}>
                  <a href={`/${c.slug}/`}>{c.name}</a>
                </li>
              ))}
            </ul>
          </>
        )}
        <span dangerouslySetInnerHTML={{ __html: sidebar?.html }} />
      </div>
    </div>
  );
};

export const pageQuery = graphql`
  query CategoryQuery(
    $ids: [String]!
    $sort: SortOrderEnum
    $categorySlug: String
    $categoryPageId: String
    $showPosts: Boolean!
  ) {
    sidebar: markdownRemark(fields: { slug: { eq: "/imports/sidebar/" } }) {
      html
      fields {
        encrypted
      }
      frontmatter {
        url
        title
        author
        location
        showTitle
        twitter
        facebook
        dateString: date
        date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
        className
      }
    }
    categoryPage: markdownRemark(id: { eq: $categoryPageId }) {
      html
      fields {
        encrypted
      }
      frontmatter {
        url
        title
        author
        location
        showTitle
        twitter
        facebook
        albums
        showMeta
        showLink
        dateString: date
        date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
        className
      }
    }
    allMarkdownRemark(
      sort: { order: [$sort], fields: [frontmatter___date] }
      filter: {
        id: { in: $ids }
        frontmatter: {
          pin: { ne: true }
          categoryPins: { nin: [$categorySlug] }
          show: { ne: $showPosts }
        }
      }
      limit: 4000
    ) {
      edges {
        node {
          excerpt(pruneLength: 250)
          fields {
            slug
            encrypted
          }
          frontmatter {
            author
            location
            title
            showRead
            showMeta
            dateString: date
            date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
            size
          }
          hero {
            childImageSharp {
              gatsbyImageData(
                layout: FULL_WIDTH
                aspectRatio: 1.77
                transformOptions: { fit: COVER, cropFocus: ATTENTION }
              )
            }
          }
        }
      }
    }
    pinned: allMarkdownRemark(
      sort: { order: [ASC], fields: [frontmatter___date] }
      filter: {
        id: { in: $ids }
        frontmatter: {
          pin: { eq: true }
          categoryPins: { nin: [$categorySlug] }
          show: { ne: $showPosts }
        }
      }
      limit: 4000
    ) {
      edges {
        node {
          excerpt(pruneLength: 250)
          fields {
            slug
            encrypted
          }
          frontmatter {
            author
            location
            title
            showRead
            showMeta
            pinOrder
            dateString: date
            date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
            size
          }
          hero {
            childImageSharp {
              gatsbyImageData(
                layout: FULL_WIDTH
                aspectRatio: 1.77
                transformOptions: { fit: COVER, cropFocus: ATTENTION }
              )
            }
          }
        }
      }
    }
    categoryPinned: allMarkdownRemark(
      sort: { order: [ASC], fields: [frontmatter___date] }
      filter: {
        id: { in: $ids }
        frontmatter: {
          categoryPins: { in: [$categorySlug] }
          show: { ne: $showPosts }
        }
      }
      limit: 4000
    ) {
      edges {
        node {
          excerpt(pruneLength: 250)
          fields {
            slug
            encrypted
          }
          frontmatter {
            author
            location
            title
            showRead
            showMeta
            pinOrder
            dateString: date
            date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
            size
          }
          hero {
            childImageSharp {
              gatsbyImageData(
                layout: FULL_WIDTH
                aspectRatio: 1.77
                transformOptions: { fit: COVER, cropFocus: ATTENTION }
              )
            }
          }
        }
      }
    }
  }
`;

export default compose(
  withEncryptedProvider(({ data: { categoryPage } }) => ({
    encrypted: categoryPage?.fields?.encrypted ?? false,
  })),
  CategoryTemplate
);
