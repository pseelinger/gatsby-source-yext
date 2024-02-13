# gatsby-source-yext

This source plugin for Gatsby will make Yext data available in your Gatsby site. Currently only supports retrieving entities.

## Installation

    yarn add pseelinger/gatsby-source-yext



## Configuration

    // In your gatsby-config.js
    module.exports = {
      plugins: [
        {
          resolve: `gatsby-source-yext`,
          options: {
            apiKey
            apiVersion
            accountId
            }
        }
    ]






