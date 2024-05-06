import fetch, { HeadersInit } from "node-fetch"

import type {IPluginOptionsInternal, YextManagementAPIRequestResponse} from "./types";

const headers = {
  "Content-Type": `application/json`,
} satisfies HeadersInit

export async function fetchFolders(pluginOptions: IPluginOptionsInternal, pageToken = '') : Promise<YextManagementAPIRequestResponse> {
  const { apiKey, accountId, apiVersion } = pluginOptions;
  const url = `https://api.yextapis.com/v2/accounts/${accountId}/folders?api_key=${apiKey}&v=${apiVersion}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
  const response = await fetch(url, {
    method: `GET`,
    headers,
  })

  return await response.json()
}

export async function fetchContent( pluginOptions: IPluginOptionsInternal, pageToken = '') : Promise<YextManagementAPIRequestResponse> {
  const { apiKey, accountId, apiVersion, entityTypes } = pluginOptions;
  const url = `https://api.yextapis.com/v2/accounts/${accountId}/entities?api_key=${apiKey}&v=${apiVersion}&entityTypes=${entityTypes.join(',')}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
  const response = await fetch(url, {
    method: `GET`,
    headers,
  })

  return await response.json()
}
