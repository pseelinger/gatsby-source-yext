import type { GatsbyNode } from "gatsby"

import { forEach, upperFirst } from "lodash"

import type { IPluginOptionsInternal, YextEntityRequestResponse, YextEntity } from "./types";
import { fetchContent } from "./utils";

export const sourceNodes: GatsbyNode[`sourceNodes`] = async (gatsbyApi, pluginOptions: IPluginOptionsInternal) => {
    const { reporter, createNodeId } = gatsbyApi
    reporter.info(`gatsby-source-yext sourceNodes...`)
    const response : YextEntityRequestResponse = await fetchContent("entities", pluginOptions)
    const { errors } = response.meta

    if (errors.length) {
        reporter.panic(`Error fetching entities from Yext: ${errors[0].message}`)
    } else {
        const { entities } = response.response
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
            gatsbyApi.actions.createNode(node);
        });
    }
}