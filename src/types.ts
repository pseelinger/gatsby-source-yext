import type { PluginOptions as GatsbyDefaultPluginOptions, IPluginRefOptions } from "gatsby"


type YextEntityMeta = {
  id: string,
  accountId: string,
  timestamp: string,
  folderId: string,
  countryCode: string,
  language: string,
  entityType: string,
}

export type YextEntity = {
  meta: YextEntityMeta
}

type YextEntityRequestError = {
  code: number,
  type: string,
  message: string,
  name: string,
}

type YextEntityResponseMeta = {
    uuid: string,
    errors: YextEntityRequestError[],
}

type YextEntityResponse = {
    entities: YextEntity[]
    count: number
    pageToken?: string
}

export type YextEntityRequestResponse = {
    response: YextEntityResponse
    meta: YextEntityResponseMeta
}


interface IPluginOptionsKeys {
  apiKey: string,
  accountId: string,
  apiVersion: string
}

/**
 * Gatsby expects the plugin options to be of type "PluginOptions" for gatsby-node APIs (e.g. sourceNodes)
 */
export interface IPluginOptionsInternal extends IPluginOptionsKeys, GatsbyDefaultPluginOptions {}

/**
 * These are the public TypeScript types for consumption in gatsby-config
 */
export interface IPluginOptions extends IPluginOptionsKeys, IPluginRefOptions {}
