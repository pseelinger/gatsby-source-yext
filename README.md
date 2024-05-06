# gatsby-source-yext

This source plugin for Gatsby will make Yext data available in your Gatsby site. Currently only supports retrieving entities.

## Installation

    yarn add pseelinger/gatsby-source-yext

## Yext Setup

You will need to create a private app in your Yext account. See the guide [here](https://hitchhikers.yext.com/guides/create-an-app/) on how to do so.
The app will provide you with your API key to use in your `gatsby-config.js` file.
Your app must have permission to read the Management API.

This plugin will retrieve all entities with the types you specify in the config below. It will also retrieve
folders for each entity type. Due to the flexible nature of Yext entities, the plugin uses Gatsby's automatic
type inference to create nodes for each entity type.

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
                entityTypes: [], // Required, Array of entity types to retireve from Yext. See https://hitchhikers.yext.com/docs/managementapis/content/entities#operation/listEntities. 
                pageLimit: 10 // Number of items to retrieve per request, default is 10
            }
        }
    ]






