import { SourceNodesArgs } from "gatsby";
import type { IPluginOptionsInternal, YextDoc, YextManagementAPIRequestResponse } from "./types";
/**
 * Fetch utility for requests to the Yext api.
 */
export declare function fetchContent<T>(contentEndpoint: string, pluginOptions: IPluginOptionsInternal, pageToken?: string): Promise<T>;
export declare function fetchManagementApi(contentType: string, pluginOptions: IPluginOptionsInternal, pageToken?: string): Promise<YextManagementAPIRequestResponse>;
export declare function entityNodeFormatter(entity: YextDoc, gatsbyApi: SourceNodesArgs): Promise<void>;
export declare function checkForImageFields(node: any, createNodeField: any, createNodeId: any, getCache: any, createNode: any): Promise<void>;
