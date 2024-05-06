import type { GatsbyNode } from "gatsby"
import {IPluginOptionsInternal} from "./types";
import { upperFirst } from "lodash";

export const createSchemaCustomization: GatsbyNode[`createSchemaCustomization`] = async (gatsbyApi, pluginOptions: IPluginOptionsInternal) => {
    const { actions } = gatsbyApi
    const { entityTypes } = pluginOptions;
    const { createTypes } = actions;

    entityTypes.forEach((entityType) => {
        const typeName = `Yext${upperFirst(entityType)}`;
        createTypes(`
            type ${typeName} implements Node {
                folder: YextFolder @link(by: "folderId", from: "meta.folderId")
            }
        `);
    });
}