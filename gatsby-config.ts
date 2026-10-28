import type { GatsbyConfig } from 'gatsby';
import config from './src/config';

const gatsbyConfig: GatsbyConfig = {
  siteMetadata: {
    title: 'Guido Tapia Oré',
    description:
      'Guido Tapia Oré is a Solutions Technical Advisor and Technical Lead who audits codebases, writes the proposals that win the work, and ships React and Node.js products.',
    // Canonical URL used for og:image, og:url, sitemap and robots.txt. No trailing slash.
    // Update this (and netlify.toml redirects) if a custom domain is attached.
    siteUrl: 'https://guidore.netlify.app',
    image: '/og.png', // Path to an image in the 'static' folder
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components',
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-robots-txt',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Guido Tapia Oré',
        short_name: 'Guido Tapia Oré',
        start_url: '/',
        background_color: config.colors.darkNavy,
        theme_color: config.colors.navy,
        display: 'minimal-ui',
        icon: 'src/images/favicons/favicon-32x32.png',
      },
    },
    'gatsby-plugin-offline',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/content/`,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            // Open external links from markdown content in a new tab
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow noopener noreferrer',
            },
          },
        ],
      },
    },
  ],
};

export default gatsbyConfig;
