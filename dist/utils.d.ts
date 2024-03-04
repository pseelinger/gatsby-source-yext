import type { IPluginOptionsInternal } from "./types";
/**
 * Fetch utility for requests to the Yext api.
 */
export declare function fetchContent<T>(contentEndpoint: string, pluginOptions: IPluginOptionsInternal, pageToken?: string): Promise<T>;
