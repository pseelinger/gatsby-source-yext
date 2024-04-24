import type { GatsbyNode, SourceNodesArgs } from "gatsby"
import type { Reporter } from "gatsby-cli/lib/reporter/reporter";

import { forEach, upperFirst } from "lodash"

import type {IPluginOptionsInternal, YextContentEndpoint, YextDoc, YextEntityRequestResponse} from "./types";
import { fetchContent, fetchManagementApi } from "./utils";
import { PLUGIN_NAME } from "./constants";

let isFirstSource = true;

export const sourceNodes: GatsbyNode[`sourceNodes`] = async (gatsbyApi, pluginOptions: IPluginOptionsInternal) => {
    const { reporter, actions, getNodes } = gatsbyApi
    const { touchNode } = actions

    const { api, endpoints, apiKey, apiVersion, accountId } = pluginOptions;
    let hasRequiredOptions = true;
    if (!api) {
        reporter.panic(`${PLUGIN_NAME}: Missing required option "api". Use either "management" or "content-delivery"`);
        hasRequiredOptions = false;
    }
    if (!apiKey) {
        reporter.panic(`${PLUGIN_NAME}: Missing required option "apiKey"`);
        hasRequiredOptions = false;
    }
    if (api === 'content-delivery' && !endpoints) {
        reporter.panic(`${PLUGIN_NAME}: Missing required option "endpoints"`);
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


    if (api === 'content-delivery') {
        await Promise.all(forEach(endpoints, async (contentEndpoint) => {
            await fetchContentFromEndpoint(contentEndpoint, gatsbyApi, pluginOptions, reporter);
        }));
    } else {
        await fetchContentFromManagementApi(gatsbyApi, pluginOptions, reporter);
    }

    sourcingTimer.end();
}

async function fetchContentFromEndpoint(contentEndpoint: string, gatsbyApi: SourceNodesArgs, pluginOptions: IPluginOptionsInternal, reporter: Reporter) {
    const sourcingTimer = reporter.activityTimer(`${PLUGIN_NAME}: Fetching items from Yext content endpoint: ${contentEndpoint}`);
    sourcingTimer.start();

    const { createNodeId, createContentDigest, actions } = gatsbyApi;
    const { createNode } = actions;

    let hasNextPage = true;
    let pageToken = null;
    while (hasNextPage) {
        const response : YextContentEndpoint = await fetchContent(contentEndpoint, pluginOptions, pageToken);
        const { errors } = response.meta

        if (errors.length) {
            sourcingTimer.panicOnBuild(`${PLUGIN_NAME}: Error fetching content from Yext: ${errors[0].message}`)
        } else {
            const { docs, nextPageToken } = response.response
            if (nextPageToken) {
                pageToken = nextPageToken;
            } else {
                hasNextPage = false;
            }
            forEach(docs, (entity: YextDoc) => {
                if (!entity.meta?.entityType?.id) {
                    reporter.warn(`${PLUGIN_NAME}: Skipping entity missing entityType with id ${entity.id}. Did you include the "meta", "meta.entityType", and "meta.entityType.id" fields in your endpoint response?`);
                    return;
                }
                const nodeType = `Yext${upperFirst(entity.meta.entityType.id)}`;
                const node = {
                    ...entity,
                    id: createNodeId(`${nodeType}-${entity.id}`),
                    parent: null,
                    children: [],
                    internal: {
                        type: nodeType,
                        contentDigest: createContentDigest(entity),
                    },
                }
                createNode(node);
            });
        }
    }

    sourcingTimer.end();
}

async function fetchContentFromManagementApi(gatsbyApi: SourceNodesArgs, pluginOptions: IPluginOptionsInternal, reporter: Reporter) {
    const { createNodeId, createContentDigest, actions } = gatsbyApi;
    const { createNode } = actions;
    const sourcingTimer = reporter.activityTimer(`${PLUGIN_NAME}: Fetching entities from Yext Management API`);
    sourcingTimer.start();

    let nextPageToken = '';
    while (nextPageToken !== undefined) {
        const response : YextEntityRequestResponse = await fetchManagementApi('entities', pluginOptions, nextPageToken);
        const { errors } = response.meta
        if (errors.length) {
            reporter.panicOnBuild(`${PLUGIN_NAME}: Error fetching entities from Yext: ${errors[0].message}`)
        } else {
            const { entities, pageToken } = response.response
            nextPageToken = pageToken;
            forEach(entities, (entity) => {
                const nodeType = `Yext${upperFirst(entity.meta.entityType)}`;
                const node = {
                    ...entity,
                    id: createNodeId(`${nodeType}-${entity.meta.id}`),
                    parent: null,
                    children: [],
                    internal: {
                        type: nodeType,
                        contentDigest: createContentDigest(entity),
                    },
                }
                createNode(node);
            });
        }
    }
    sourcingTimer.end();
}