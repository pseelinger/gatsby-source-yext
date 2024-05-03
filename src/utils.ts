import { createRemoteFileNode } from "gatsby-source-filesystem";
import {map, upperFirst, keys, forEach, isArray, isObject} from "lodash";
import { SourceNodesArgs } from "gatsby";
import fetch, { HeadersInit } from "node-fetch"

import type {IPluginOptionsInternal, YextDoc, YextPhotoField, YextManagementAPIRequestResponse} from "./types";

const headers = {
  "Content-Type": `application/json`,
} satisfies HeadersInit

/**
 * Fetch utility for requests to the Yext api.
 */
export async function fetchContent<T>(contentEndpoint: string, pluginOptions: IPluginOptionsInternal, pageToken = ''): Promise<T> {
  const { apiKey, accountId, apiVersion } = pluginOptions;
  const url = `https://cdn.yextapis.com/v2/accounts/${accountId}/content/${contentEndpoint}?api_key=${apiKey}&v=${apiVersion}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
  const response = await fetch(url, {
    method: `GET`,
    headers,
  })

  return await response.json()
}

export async function fetchManagementApi(contentType: string, pluginOptions: IPluginOptionsInternal, pageToken = '') : Promise<YextManagementAPIRequestResponse> {
  const { apiKey, accountId, apiVersion } = pluginOptions;
  const url = `https://api.yextapis.com/v2/accounts/${accountId}/${contentType}?api_key=${apiKey}&v=${apiVersion}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
  const response = await fetch(url, {
    method: `GET`,
    headers,
  })

  return await response.json()
}

function isYextPhotoField(value: any) : value is YextPhotoField {
  if (!value) {
    return false;
  }
  return (value as YextPhotoField).url !== undefined;
}

export async function entityNodeFormatter (entity: YextDoc, gatsbyApi: SourceNodesArgs) {
  const { createNodeId, createContentDigest, actions: { createNode } } = gatsbyApi;
  const nodeType = `Yext${upperFirst(entity.meta.entityType.id)}`;
  createNode({
    ...entity,
    id: createNodeId(`${nodeType}-${entity.id}`),
    parent: null,
    children: [],
    internal: {
      type: nodeType,
      contentDigest: createContentDigest(entity),
    },
  });
}

export async function checkForImageFields(node, createNodeField, createNodeId, getCache, createNode) {
  await Promise.all(forEach(keys(node), async key => {
    if (isImageFieldOrArrayOfImageFields(node[key])) {
      await createImageField(node, key, createNodeField, createNodeId, getCache, createNode);
    }
    if (isObject(node[key])) {
      await Promise.all(forEach(keys(node[key]), async objectKey => {
        await checkForImageFields(node[key][objectKey], createNodeField, createNodeId, getCache, createNode);
      }))
    }
  }));
}

async function createImageField (node, key: string, createNodeField, createNodeId, getCache, createNode) {
  if (node[key]) {
    if (isArray(node[key])) {
      let images = await Promise.all(
          map(node[key], async ({ image }) => {
            return await createImageFileNode(image, node, createNodeId, getCache, createNode);
          })
      );
      if (images) {
        createNodeField({
          node,
          name: node[key],
          value: map(images, 'id')
        });
      }
    } else {
      let image = await createImageFileNode(node[key], node, createNodeId, getCache, createNode);

      if (image) {
        createNodeField({
          node,
          name: node[key],
          value: image
        });
      }
    }
  }
}

async function createImageFileNode(image: YextPhotoField, node, createNodeId, getCache, createNode) {
  try {
    return await createRemoteFileNode({
      url: image.url,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      getCache
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

function isImageFieldOrArrayOfImageFields(value: any) {
  if (isYextPhotoField(value)) {
    return true;
  }
  if (isArray(value)) {
    let isArrayOfImages = false;
    forEach(value, singleValue => {
      if (isImageFieldOrArrayOfImageFields(singleValue)) {
        isArrayOfImages = true;
      }
    })
    return isArrayOfImages;
  }
  return false;
}
