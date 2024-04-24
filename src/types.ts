import type {PluginOptions as GatsbyDefaultPluginOptions, IPluginRefOptions} from "gatsby"

type YextEntityType = {
    id: string,
    uid: number
}

type YextEntityMeta = {
    id: string,
    accountId: string,
    timestamp: string,
    folderId: string,
    countryCode: string,
    language: string,
    entityType: string,
}

type YextDocMeta = {
    entityType: YextEntityType,
    locale: string,
}

export type YextDoc = {
    meta: YextDocMeta
    id: string
}

export type YextEntity = {
    meta: YextEntityMeta
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

type YextEntityResponse = {
    entities: YextEntity[]
    count: number
    pageToken?: string
}

export type YextContentEndpoint = {
    response: YextContentEndpointResponse
    meta: YextEntityResponseMeta
}

export type YextEntityRequestResponse = {
    response: YextEntityResponse
    meta: YextEntityResponseMeta
}

export type YextPhotoField = {
    url: string,
    sourceUrl?: string,
    width: number,
    height: number,
}

export type GatsbyYextEntity = {
    id: string,
    parent?: string,
    children: string[],
    internal: {
        type: string,
        contentDigest: string,
    }
}
interface IPluginOptionsKeys {
    apiKey: string,
    api: string,
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
