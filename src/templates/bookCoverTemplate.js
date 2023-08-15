import React from 'react';
import '../styles/site.global.scss';
import { Analytics } from '../components/Analytics';
import { graphql } from 'gatsby';
import Helmet from 'react-helmet';
import { Header } from '../components/Header';
import DiaryTemplate from './diaryTemplate';
import * as styles from './bookCoverTemplate.module.scss';
import classNames from 'classnames/bind';
import { emoji } from '../utils/emoji';
import { decode } from 'html-entities';

const cx = classNames.bind(styles);

const BookCoverTemplate = ({
  includeHeader = true,
  pageContext: { book },
  data,
}) => {
  const { title, back } = data;

  return (
    <>
      {includeHeader && (
        <>
          <Analytics />
          <Helmet title={`${book.title} - Cover`}></Helmet>
          <Header className={cx('header')} />
        </>
      )}
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;1,400;1,600;1,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,700;1,300;1,700;1,600&display=swap"
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
            

            ${
              !back
                ? `
                    --cover-size: 6in 9in;
                    --cover-hinge: 0in;
                    --cover-margin: 0in;
                    --cover-wrap: 0in;
                    --cover-spine: 0in;
                    --cover-height: 9in;
                    --cover-width: 6in;
                    --cover-full-width: 6in;
                    --cover-full-height: 9in;
                  `
                : ''
            }
          }

          @media print {
            :root {
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

              ${
                !back
                  ? `
                    --cover-size: 6in 9in;
                    --cover-hinge: 0in;
                    --cover-margin: 0in;
                    --cover-wrap: 0in;
                    --cover-spine: 0in;
                    --cover-height: 9in;
                    --cover-width: 6in;
                    --cover-full-width: 6in;
                    --cover-full-height: 9in;
                  `
                  : ''
              }
            }
          }
        `,
        }}
      />
      <div className={cx('toolbar')}>
        <a
          href={`https://gosolid.dev${book.slug.replace(/\/$/, '')}?force=true`}
          target="_blank"
        >
          Recreate
        </a>
        <a
          href={`https://gosolid.d${book.slug.replace(/\/$/, '')}?test=true`}
          target="_blank"
        >
          Test
        </a>
      </div>
      <div className={cx('cover', { justFront: !back })}>
        <div>
          {back && (
            <>
              <div
                className={cx('backCover')}
                style={{
                  backgroundColor:
                    back.frontmatter.backgroundColor ?? 'var(--color-primary)',
                  color: back.frontmatter.color ?? 'var(--color-secondary)',
                }}
              >
                <div
                  style={{
                    '--color-primary-from':
                      back.frontmatter.color ?? 'var(--color-secondary)',
                    '--color-secondary-from':
                      back.frontmatter.backgroundColor ??
                      'var(--color-primary)',
                    '--font-primary': 'var(--font-book-back)',
                  }}
                >
                  <div
                    style={{
                      '--color-link': 'var(--color-primary-from)',
                      '--color-link-visited': 'var(--color-primary-from)',
                      '--color-link-light': 'var(--color-primary-from)',
                      '--color-primary': 'var(--color-primary-from)',
                      '--color-line': 'var(--color-primary-from)',
                      '--color-secondary': 'var(--color-secondary-from)',
                      fontFamily: 'var(--font-primary)',
                    }}
                  >
                    <DiaryTemplate
                      data={{ markdownRemark: back }}
                      includeMeta={false}
                      includeUrl={false}
                      includeBacklinks={false}
                    />
                  </div>
                </div>
                {book.barcode !== false && <div className={cx('barcode')} />}
              </div>
              <div
                className={cx('spine')}
                style={{
                  backgroundColor:
                    back.frontmatter.backgroundColor ?? 'var(--color-primary)',
                  color: back.frontmatter.color ?? 'var(--color-secondary)',
                }}
              >
                <div>
                  <div>
                    <h1
                      dangerouslySetInnerHTML={{
                        __html: emoji(decode(book.title)),
                      }}
                    />
                    <h2
                      dangerouslySetInnerHTML={{
                        __html: emoji(decode(book.author)),
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          <div
            className={cx('frontCover')}
            style={{
              backgroundColor:
                title.frontmatter.backgroundColor ?? 'var(--color-primary)',
              color: title.frontmatter.color ?? 'var(--color-secondary)',
            }}
          >
            <div>
              <DiaryTemplate
                data={{ markdownRemark: title }}
                includeMeta={false}
                includeUrl={false}
                includeBacklinks={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const pageQuery = graphql`
  query ($frontSlug: String!, $backSlug: String) {
    title: markdownRemark(fields: { slug: { eq: $frontSlug } }) {
      html
      excerpt(pruneLength: 400)
      frontmatter {
        dateString: date
        isoDate: date(formatString: "YYYY-MM-DDTHH:mm:ssZ")
        date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
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
      }
      fields {
        encrypted
        slug
      }
    }
    back: markdownRemark(fields: { slug: { eq: $backSlug } }) {
      html
      excerpt(pruneLength: 400)
      frontmatter {
        isoDate: date(formatString: "YYYY-MM-DDTHH:mm:ssZ")
        date(formatString: "ddd Do MMMM YYYY H:mm:ss a z")
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
      }
      fields {
        encrypted
        slug
      }
    }
  }
`;

export default BookCoverTemplate;

export { pageQuery };
