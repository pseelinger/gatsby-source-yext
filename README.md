# gatsby-source-yext

This source plugin for Gatsby will make Yext data available in your Gatsby site. Currently only supports retrieving entities.

## Installation

    yarn add pseelinger/gatsby-source-yext

## Yext Setup

You will need to create a private app in your Yext account. See the guide [here](https://hitchhikers.yext.com/guides/create-an-app/) on how to do so.
The app will provide you with your API key to use in your `gatsby-config.js` file.
Your app must have permission to read the Content API endpoint (under Content Delivery API).

After that, you will need to create one or more [Content Endpoints](https://hitchhikers.yext.com/guides/content-endpoints-get-started/), which will serve the data to Gatsby.
You can configure the fields for your entity types however you like, however these fields are required in order for the plugin to function:

1. `id` - Will be used to create node IDs in Gatsby
2. `meta` - will be used to generate type definitions in Gatsby

## Configuration

    // In your gatsby-config.js
    module.exports = {
      plugins: [
        {
          resolve: `gatsby-source-yext`,
          options: {
                apiKey: '', // Required, API key for your private app 
                apiVersion: '', // Required, Desired api version, formatted date (YYYYMMDD)
                accountId: '', // Required, Your Yext account ID
                endpoints: [], // Required, Array of content endpoints setup in your private app
                pageLimit: 10 // Number of items to retrieve per request, default is 10
            }
        }
    ]






