import type { IPluginOptionsInternal } from "./types";
import fetch, { HeadersInit } from "node-fetch"

const headers = {
  "Content-Type": `application/json`,
} satisfies HeadersInit

/**
 * Fetch utility for requests to the Yext api.
 */
export async function fetchContent<T>(contentType: string, pluginOptions: IPluginOptionsInternal, pageToken = ''): Promise<T> {
  const { apiKey, accountId, apiVersion } = pluginOptions;
  const url = `https://api.yextapis.com/v2/accounts/${accountId}/${contentType}?api_key=${apiKey}&v=${apiVersion}&limit=25${pageToken ? `&pageToken=${pageToken}` : ''}`;
  const response = await fetch(url, {
    method: `GET`,
    headers,
  })

  return await response.json()
}
