import type { IPluginOptionsInternal, YextManagementAPIRequestResponse } from "./types";
export declare function fetchFolders(pluginOptions: IPluginOptionsInternal, pageToken?: string): Promise<YextManagementAPIRequestResponse>;
export declare function fetchContent(pluginOptions: IPluginOptionsInternal, pageToken?: string): Promise<YextManagementAPIRequestResponse>;
