import type {PluginOptions as GatsbyDefaultPluginOptions, IPluginRefOptions} from "gatsby"

type YextEntityType = {
    id: string,
    uid: number
}

type YextDocMeta = {
    entityType: YextEntityType,
    locale: string,
}

export type YextDoc = {
    meta: YextDocMeta
    id: string
}

type YextContentRequestError = {
    code: number,
    type: string,
    message: string,
    name: string,
}

type YextEntityResponseMeta = {
    uuid: string,
    errors: YextContentRequestError[],
}

type YextContentEndpointResponse = {
    docs: YextDoc[]
    count: number
    nextPageToken?: string
}

export type YextContentEndpoint = {
    response: YextContentEndpointResponse
    meta: YextEntityResponseMeta
}


interface IPluginOptionsKeys {
    apiKey: string,
    accountId: string,
    apiVersion: string,
    endpoints: string[],
    pageLimit: number
}

/**
 * Gatsby expects the plugin options to be of type "PluginOptions" for gatsby-node APIs (e.g. sourceNodes)
 */
export interface IPluginOptionsInternal extends IPluginOptionsKeys, GatsbyDefaultPluginOptions {
}

/**
 * These are the public TypeScript types for consumption in gatsby-config
 */
export interface IPluginOptions extends IPluginOptionsKeys, IPluginRefOptions {
}
