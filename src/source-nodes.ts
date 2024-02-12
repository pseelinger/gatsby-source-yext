import type { GatsbyNode } from "gatsby"

import { forEach, upperFirst } from "lodash"

import type { IPluginOptionsInternal, YextEntityRequestResponse, YextEntity } from "./types";
import { fetchContent } from "./utils";
import { PLUGIN_NAME } from "./constants";

let isFirstSource = true;

export const sourceNodes: GatsbyNode[`sourceNodes`] = async (gatsbyApi, pluginOptions: IPluginOptionsInternal) => {
    const { reporter, createNodeId, actions, getNodes } = gatsbyApi
    const { createNode, touchNode } = actions

    const sourcingTimer = reporter.activityTimer(`Sourcing entities from Yext`);
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

    let nextPageToken = '';
    while (nextPageToken !== undefined) {
        const response : YextEntityRequestResponse = await fetchContent("entities", pluginOptions, nextPageToken);
        const { errors } = response.meta

        if (errors.length) {
            sourcingTimer.panicOnBuild(`Error fetching entities from Yext: ${errors[0].message}`)
        } else {
            const { entities, pageToken } = response.response
            nextPageToken = pageToken;
            forEach(entities, (entity: YextEntity) => {
                const nodeType = `Yext${upperFirst(entity.meta.entityType)}`;
                const node = {
                    ...entity,
                    id: createNodeId(`${nodeType}-${entity.meta.id}`),
                    parent: null,
                    children: [],
                    internal: {
                        type: nodeType,
                        contentDigest: gatsbyApi.createContentDigest(entity),
                    },
                }
                createNode(node);
            });
        }
    }
    sourcingTimer.end();
}