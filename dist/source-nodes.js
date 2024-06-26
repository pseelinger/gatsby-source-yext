"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceNodes = void 0;
const lodash_1 = require("lodash");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
let isFirstSource = true;
const sourceNodes = (gatsbyApi, pluginOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { reporter, actions, getNodes } = gatsbyApi;
    const { touchNode } = actions;
    const { entityTypes, apiKey, apiVersion, accountId } = pluginOptions;
    let hasRequiredOptions = true;
    if (!entityTypes) {
        reporter.panic(`${constants_1.PLUGIN_NAME}: Missing required option "entityTypes". See https://hitchhikers.yext.com/docs/managementapis/content/entities#operation/listEntities`);
        hasRequiredOptions = false;
    }
    if (!apiKey) {
        reporter.panic(`${constants_1.PLUGIN_NAME}: Missing required option "apiKey"`);
        hasRequiredOptions = false;
    }
    if (!apiVersion) {
        reporter.panic(`${constants_1.PLUGIN_NAME}: Missing required option "apiVersion"`);
        hasRequiredOptions = false;
    }
    if (!accountId) {
        reporter.panic(`${constants_1.PLUGIN_NAME}: Missing required option "accountId"`);
        hasRequiredOptions = false;
    }
    if (!hasRequiredOptions) {
        return;
    }
    const sourcingTimer = reporter.activityTimer(`Sourcing content from Yext`);
    sourcingTimer.start();
    if (isFirstSource) {
        (0, lodash_1.forEach)(getNodes(), (node) => {
            if (node.internal.owner !== constants_1.PLUGIN_NAME) {
                return;
            }
            touchNode(node);
        });
        isFirstSource = false;
    }
    const contentTypes = ['entities', 'folders'];
    yield Promise.all((0, lodash_1.map)(contentTypes, (contentType) => {
        return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
            yield fetchContentFromManagementApi(contentType, gatsbyApi, pluginOptions, reporter);
            resolve();
        }));
    }));
    sourcingTimer.end();
});
exports.sourceNodes = sourceNodes;
function fetchContentFromManagementApi(contentType, gatsbyApi, pluginOptions, reporter) {
    return __awaiter(this, void 0, void 0, function* () {
        const { createNodeId, createContentDigest, actions } = gatsbyApi;
        const { createNode } = actions;
        const sourcingTimer = reporter.activityTimer(`${constants_1.PLUGIN_NAME}: Fetching ${contentType} from Yext Management API`);
        sourcingTimer.start();
        let hasNextPage = true;
        let nextPageToken = null;
        while (hasNextPage) {
            let response;
            if (contentType === 'entities') {
                response = yield (0, utils_1.fetchContent)(pluginOptions, nextPageToken);
            }
            else {
                response = yield (0, utils_1.fetchFolders)(pluginOptions, nextPageToken);
            }
            const { errors } = response.meta;
            if (errors.length) {
                reporter.panicOnBuild(`${constants_1.PLUGIN_NAME}: Error fetching ${contentType} from Yext: ${errors[0].message}`);
                hasNextPage = false;
            }
            else {
                const { pageToken } = response.response;
                const contentNodes = response.response[contentType];
                if (!pageToken) {
                    hasNextPage = false;
                }
                else {
                    nextPageToken = pageToken;
                }
                (0, lodash_1.forEach)(contentNodes, (contentNode) => {
                    let data = {}, nodeType, uniqueId;
                    if (contentType === 'entities') {
                        nodeType = `Yext${(0, lodash_1.upperFirst)(contentNode.meta.entityType)}`;
                        uniqueId = contentNode.meta.id;
                        data = contentNode;
                    }
                    else {
                        nodeType = `YextFolder`;
                        uniqueId = contentNode.id;
                        data = Object.assign(Object.assign({}, contentNode), { folderId: contentNode.id });
                    }
                    const node = Object.assign(Object.assign({}, data), { id: createNodeId(`${nodeType}-${uniqueId}`), parent: null, children: [], internal: {
                            type: nodeType,
                            contentDigest: createContentDigest(data),
                        } });
                    createNode(node);
                });
            }
        }
        sourcingTimer.end();
    });
}
