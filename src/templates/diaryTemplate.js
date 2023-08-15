import React, { useEffect, useState, useRef } from 'react';
import '../styles/site.global.scss';
import { Analytics } from '../components/Analytics';
import { Link, graphql } from 'gatsby';
import Helmet from 'react-helmet';
import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import LocationOnRoundedIcon from '@material-ui/icons/LocationOnRounded';
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded';
import { Header } from '../components/Header';
import { PostContent } from '../components/PostContent';
import { withEncryptedProvider, useEncrypted } from '../hooks/useEncrypted';
import { decode } from 'html-entities';
import { compose } from '@grexie/compose';
import { ReactComponent as LinkIcon } from '../images/link.svg';
import authors from '../../content/authors.json';
import { selectCategory } from '../utils/selectCategory';
import { formatDate } from '../utils/formatDate';
import smartquotes from 'smartquotes';
import { emoji } from '../utils/emoji';
import { GatsbyImage } from 'gatsby-plugin-image';
// import { Veritas } from '@grexie/veritas/react';

import * as styles from './diaryTemplate.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const prepareExcerpt = excerpt => excerpt?.replace(/@\w+\([^)]+\)/g, '');

const DiaryTemplate = ({
  includeMeta = true,
  includeUrl = true,
  includeBacklinks = true,
  pageBreakBefore = false,
  pageContext: { next, previous, backlink } = {},
  data,
}) => {
  const page = useRef();
  const { markdownRemark } = data;
  const { excerpt, frontmatter, fields, html, hero } = markdownRemark;
  const author = authors[frontmatter.author?.toLowerCase()];
  const location = frontmatter.location;
  const { decrypted } = useEncrypted();
  const bottomRef = useRef();
  const [unread, setUnread] = useState(false);

  let categories = selectCategory(fields.slug, frontmatter.categories ?? []);

  useEffect(() => {
    typeof localStorage === 'undefined'
      ? false
      : localStorage.getItem(fields.slug) !== 'read';
  }, []);

  useEffect(() => {
    if (unread) {
      localStorage.removeItem(fields.slug);
    } else {
      localStorage.setItem(fields.slug, 'read');
    }
  }, [unread]);

  useEffect(() => {
    const observer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setUnread(false);
        }
      });
    });

    const el = bottomRef.current;

    if (el) {
      observer.observe(el);

      return () => observer.unobserve(el);
    }
  }, [decrypted]);

  if (decrypted && backlink) {
    categories.unshift({
      slug: backlink.fields.slug
        .replace(/\/index\/$/, '/')
        .replace(/^\//, '')
        .replace(/\/$/, ''),
      name: backlink.frontmatter.title,
    });
  }

  var categoriesSeen = {};
  categories = categories.filter(category => {
    if (categoriesSeen[category.slug]) {
      return false;
    }

    categoriesSeen[category.slug] = true;
    return true;
  });

  return (
    <>
      {includeMeta && (
        <>
          <Analytics />
          <Helmet
            title={`${
              decrypted ? smartquotes(frontmatter.title) : 'Private'
            } | Solid`}
          >
            <link
              rel="canonical"
              href={frontmatter?.url ?? `https://gosolid.dev${fields.slug}`}
            />
            <meta
              name="twitter:title"
              content={
                decrypted
                  ? smartquotes(frontmatter.title)
                  : 'Private encrypted page | Solid'
              }
            />
            <meta
              name="twitter:description"
              content={decrypted ? prepareExcerpt(excerpt) : 'Solid'}
            />
            <meta
              name="og:url"
              content={frontmatter?.url ?? `https://gosolid.dev${fields.slug}`}
            />
            <meta
              property="og:title"
              content={
                decrypted
                  ? smartquotes(frontmatter.title)
                  : 'Private encrypted page | Solid'
              }
            />
            <meta
              property="og:description"
              content={decrypted ? prepareExcerpt(excerpt) : 'Solid'}
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
            disableAnalytics={!(frontmatter.analytics ?? true)}
            twitter={frontmatter.twitter}
            facebook={frontmatter.facebook}
            className={frontmatter.className}
          />
        </>
      )}

      <div
        className={cx('page', frontmatter.className, {
          encrypted: fields.encrypted,
          decrypted,
        })}
        id={markdownRemark.key}
        style={{
          pageBreakBefore: !pageBreakBefore
            ? 'auto'
            : markdownRemark.pageBreak ?? 'always',
        }}
        ref={page}
      >
        <div className={cx('wrapper')}>
          <div className={cx('post')}>
            {decrypted && includeBacklinks && !!categories.length && (
              <div className={cx('pagenav')}>
                {categories.map((category, i) => (
                  <Link
                    key={category.slug}
                    to={category.default ? '/' : `/${category.slug}/`}
                  >
                    {i === 0 && <ChevronLeftRoundedIcon />}
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {(!decrypted || (frontmatter.showTitle ?? true)) && (
              <h1
                className={cx('title')}
                dangerouslySetInnerHTML={{
                  __html: decrypted
                    ? emoji(decode(frontmatter.title))
                    : 'Private',
                }}
              />
            )}
            {decrypted && (
              <div className={cx('meta')}>
                {frontmatter.dateString && frontmatter.showLink !== false && (
                  <time className={cx('date')}>
                    <CalendarTodayRoundedIcon />
                    <span>{formatDate(frontmatter.dateString)}</span>
                  </time>
                )}
                {location && frontmatter.showLink !== false && (
                  <div className={cx('location')}>
                    <LocationOnRoundedIcon />
                    <span>{location}</span>
                  </div>
                )}
                {author && (
                  <a href={author.profile} target="_blank" title={author.name}>
                    <div className={cx('author')}>
                      <img src={author.avatar} />
                      <span>{author.name}</span>
                    </div>
                  </a>
                )}
              </div>
            )}
            {decrypted && includeUrl && frontmatter.showLink !== false && (
              <div className={cx('meta')}>
                <a
                  className={cx('url')}
                  href={frontmatter?.url ?? `https://gosolid.dev${fields.slug}`}
                >
                  <LinkIcon />
                  <span>
                    {frontmatter?.url ?? `https://gosolid.dev${fields.slug}`}
                  </span>
                </a>
              </div>
            )}

            {decrypted && hero?.childImageSharp?.gatsbyImageData && (
              <GatsbyImage image={hero?.childImageSharp?.gatsbyImageData} />
            )}

            <PostContent
              html={html}
              encrypted={fields.encrypted}
              hasDecrypted={fields.hasDecrypted}
            />

            {decrypted && (
              <>
                <div
                  ref={bottomRef}
                  style={{ height: 0, width: 0, flex: '0 0 auto' }}
                >
                  {'\u00a0'}
                </div>
                {frontmatter.showRead !== true && (
                  <div className={cx('toolbar', 'noprint')}>
                    {!!unread && (
                      <button onClick={() => setUnread(false)}>
                        Mark as Read
                      </button>
                    )}
                    {!unread && (
                      <button onClick={() => setUnread(true)}>
                        Mark as Unread
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const pageQuery = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt(pruneLength: 400)
      frontmatter {
        dateString: date
        date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
        title
        author
        location
        showTitle
        url
        categories
        twitter
        facebook
        className
        showLink
        showMeta
        showRead
      }
      fields {
        encrypted
        slug
      }
      hero {
        childImageSharp {
          gatsbyImageData(
            layout: FULL_WIDTH
            aspectRatio: 1.34
            transformOptions: { fit: COVER, cropFocus: ATTENTION }
          )
        }
      }
    }
  }
`;

export default compose(
  withEncryptedProvider(
    ({
      data: {
        markdownRemark: {
          fields: { encrypted },
        },
      },
    }) => ({
      encrypted,
    })
  ),
  DiaryTemplate
);

export { pageQuery };
