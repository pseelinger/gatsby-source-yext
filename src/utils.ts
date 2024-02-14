import type { IPluginOptionsInternal } from "./types";
import fetch, { HeadersInit } from "node-fetch"

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
