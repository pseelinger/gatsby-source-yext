# gatsby-source-yext

This source plugin for Gatsby will make Yext data available in your Gatsby site. Currently only supports retrieving entities.

## Configuration

    ```javascript
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






