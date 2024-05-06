import type { GatsbyNode, SourceNodesArgs } from "gatsby"
import type { Reporter } from "gatsby-cli/lib/reporter/reporter";

import { forEach, upperFirst, map } from "lodash"

import type {
    IPluginOptionsInternal,
    YextEntity, YextFolder, YextManagementAPIRequestResponse
} from "./types";
import { fetchFolders, fetchContent } from "./utils";
import { PLUGIN_NAME } from "./constants";

let isFirstSource = true;

export const sourceNodes: GatsbyNode[`sourceNodes`] = async (gatsbyApi, pluginOptions: IPluginOptionsInternal) => {
    const { reporter, actions, getNodes } = gatsbyApi
    const { touchNode } = actions

    const { entityTypes, apiKey, apiVersion, accountId } = pluginOptions;
    let hasRequiredOptions = true;
    if (!entityTypes) {
        reporter.panic(`${PLUGIN_NAME}: Missing required option "entityTypes". See https://hitchhikers.yext.com/docs/managementapis/content/entities#operation/listEntities`);
        hasRequiredOptions = false;
    }
    if (!apiKey) {
        reporter.panic(`${PLUGIN_NAME}: Missing required option "apiKey"`);
        hasRequiredOptions = false;
    }
    if (!apiVersion) {
        reporter.panic(`${PLUGIN_NAME}: Missing required option "apiVersion"`);
        hasRequiredOptions = false;
    }
    if (!accountId) {
        reporter.panic(`${PLUGIN_NAME}: Missing required option "accountId"`);
        hasRequiredOptions = false;
    }
    if (!hasRequiredOptions) {
        return;
    }

    const sourcingTimer = reporter.activityTimer(`Sourcing content from Yext`);
    sourcingTimer.start();

    if (isFirstSource) {
        forEach(getNodes(), (node) => {
            if (node.internal.owner !== PLUGIN_NAME) {
                return;
            }
            touchNode(node);
        });
        isFirstSource = false;
    }

    const contentTypes = ['entities', 'folders'];
    await Promise.all(map(contentTypes, (contentType) => {
        return new Promise<void>(async (resolve) => {
            await fetchContentFromManagementApi(contentType, gatsbyApi, pluginOptions, reporter);
            resolve();
        });
    }))

    sourcingTimer.end();
}

async function fetchContentFromManagementApi(contentType: string, gatsbyApi: SourceNodesArgs, pluginOptions: IPluginOptionsInternal, reporter: Reporter) {
    const { createNodeId, createContentDigest, actions } = gatsbyApi;
    const { createNode } = actions;
    const sourcingTimer = reporter.activityTimer(`${PLUGIN_NAME}: Fetching ${contentType} from Yext Management API`);
    sourcingTimer.start();

    let hasNextPage = true;
    let nextPageToken = null;
    while (hasNextPage) {
        let response : YextManagementAPIRequestResponse;
        if (contentType === 'entities') {
            response = await fetchContent(pluginOptions, nextPageToken);
        } else {
            response = await fetchFolders(pluginOptions, nextPageToken);
        }
        const { errors } = response.meta
        if (errors.length) {
            reporter.panicOnBuild(`${PLUGIN_NAME}: Error fetching ${contentType} from Yext: ${errors[0].message}`)
            hasNextPage = false;
        } else {
            const { pageToken } = response.response
            const contentNodes : YextFolder[] | YextEntity[] = response.response[contentType];
            if (!pageToken) {
                hasNextPage = false;
            } else {
                nextPageToken = pageToken;
            }
            forEach(contentNodes, (contentNode) => {
                let data = {},
                    nodeType : string,
                    uniqueId : string;
                if (contentType === 'entities') {
                    nodeType = `Yext${upperFirst((contentNode as YextEntity).meta.entityType)}`;
                    uniqueId = (contentNode as YextEntity).meta.id;
                    data = (contentNode as YextEntity);
                } else {
                    nodeType = `YextFolder`;
                    uniqueId = (contentNode as YextFolder).id;
                    data = {
                        ...contentNode as YextFolder,
                        folderId: (contentNode as YextFolder).id,
                    };
                }
                const node = {
                    ...data,
                    id: createNodeId(`${nodeType}-${uniqueId}`),
                    parent: null,
                    children: [],
                    internal: {
                        type: nodeType,
                        contentDigest: createContentDigest(data),
                    },
                }
                createNode(node);
            });
        }
    }
    sourcingTimer.end();
}