import type { IPluginOptionsInternal } from "./types";
import fetch, { HeadersInit } from "node-fetch"

const headers = {
  "Content-Type": `application/json`,
} satisfies HeadersInit

/**
 * Fetch utility for requests to the Yext api.
 */
export async function fetchContent<T>(contentType: string, pluginOptions: IPluginOptionsInternal): Promise<T> {
  const { apiKey, accountId, apiVersion } = pluginOptions;
  const response = await fetch(`https://api.yextapis.com/v2/accounts/${accountId}/${contentType}?api_key=${apiKey}&v=${apiVersion}`, {
    method: `GET`,
    headers,
  })

  return await response.json()
}
