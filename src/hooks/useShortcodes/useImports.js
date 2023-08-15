import React, { createContext, useContext } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { useShortcode } from './useShortcode';

export const ImportContext = createContext();

export const ImportProvider = ({ imports, children }) => {
  return (
    <ImportContext.Provider value={imports}>{children}</ImportContext.Provider>
  );
};

export const ImportStaticQueryProvider = ({ children }) => {
  const { imports } = useStaticQuery(graphql`
    query MyQuery {
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
  `);

  return <ImportProvider imports={imports}>{children}</ImportProvider>;
};

const useImports = html => {
  const imports = useContext(ImportContext);

  if (typeof html !== 'string') {
    return null;
  }

  return useShortcode(html, 'import', path => {
    if (!path.endsWith('/')) {
      path = `${path}/`;
    }

    return (
      imports?.edges?.find(edge => edge?.node?.fields?.slug === path.trim())
        ?.node?.html ?? ''
    );
  });
};

export { useImports };
