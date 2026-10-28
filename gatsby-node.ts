/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

import path from 'path';
import { GatsbyNode } from 'gatsby';

// Explicit frontmatter schema so optional fields (github, cta, ...) stay queryable
// even when no markdown file currently sets them.
// https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter
    }

    type MarkdownRemarkFrontmatter {
      date: String
      title: String
      company: String
      location: String
      range: String
      url: String
      overline: String
      cover: File @fileByRelativePath
      tech: [String]
      github: String
      external: String
      cta: String
    }
  `);
};

// https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  stage,
  loaders,
  actions,
}) => {
  // https://www.gatsbyjs.org/docs/debugging-html-builds/#fixing-third-party-modules
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /scrollreveal/,
            use: loaders.null(),
          },
          {
            test: /animejs/,
            use: loaders.null(),
          },
          {
            test: /miniraf/,
            use: loaders.null(),
          },
        ],
      },
    });
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@fonts': path.resolve(__dirname, 'src/fonts'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@images': path.resolve(__dirname, 'src/images'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
  });
};
