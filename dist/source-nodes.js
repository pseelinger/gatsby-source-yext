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
    const { api, endpoints, apiKey, apiVersion, accountId } = pluginOptions;
    let hasRequiredOptions = true;
    if (!api) {
        reporter.panic(`${constants_1.PLUGIN_NAME}: Missing required option "api". Use either "management" or "content-delivery"`);
        hasRequiredOptions = false;
    }
    if (!apiKey) {
        reporter.panic(`${constants_1.PLUGIN_NAME}: Missing required option "apiKey"`);
        hasRequiredOptions = false;
    }
    if (api === 'content-delivery' && !endpoints) {
        reporter.panic(`${constants_1.PLUGIN_NAME}: Missing required option "endpoints"`);
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
    if (api === 'content-delivery') {
        yield Promise.all((0, lodash_1.forEach)(endpoints, (contentEndpoint) => __awaiter(void 0, void 0, void 0, function* () {
            yield fetchContentFromEndpoint(contentEndpoint, gatsbyApi, pluginOptions, reporter);
        })));
    }
    else {
        yield fetchContentFromManagementApi(gatsbyApi, pluginOptions, reporter);
    }
    sourcingTimer.end();
});
exports.sourceNodes = sourceNodes;
function fetchContentFromEndpoint(contentEndpoint, gatsbyApi, pluginOptions, reporter) {
    return __awaiter(this, void 0, void 0, function* () {
        const sourcingTimer = reporter.activityTimer(`${constants_1.PLUGIN_NAME}: Fetching items from Yext content endpoint: ${contentEndpoint}`);
        sourcingTimer.start();
        const { createNodeId, createContentDigest, actions } = gatsbyApi;
        const { createNode } = actions;
        let hasNextPage = true;
        let pageToken = null;
        while (hasNextPage) {
            const response = yield (0, utils_1.fetchContent)(contentEndpoint, pluginOptions, pageToken);
            const { errors } = response.meta;
            if (errors.length) {
                sourcingTimer.panicOnBuild(`${constants_1.PLUGIN_NAME}: Error fetching content from Yext: ${errors[0].message}`);
                hasNextPage = false;
            }
            else {
                const { docs, nextPageToken } = response.response;
                if (nextPageToken) {
                    pageToken = nextPageToken;
                }
                else {
                    hasNextPage = false;
                }
                (0, lodash_1.forEach)(docs, (entity) => {
                    var _a, _b;
                    if (!((_b = (_a = entity.meta) === null || _a === void 0 ? void 0 : _a.entityType) === null || _b === void 0 ? void 0 : _b.id)) {
                        reporter.warn(`${constants_1.PLUGIN_NAME}: Skipping entity missing entityType with id ${entity.id}. Did you include the "meta", "meta.entityType", and "meta.entityType.id" fields in your endpoint response?`);
                        return;
                    }
                    const nodeType = `Yext${(0, lodash_1.upperFirst)(entity.meta.entityType.id)}`;
                    const node = Object.assign(Object.assign({}, entity), { id: createNodeId(`${nodeType}-${entity.id}`), parent: null, children: [], internal: {
                            type: nodeType,
                            contentDigest: createContentDigest(entity),
                        } });
                    createNode(node);
                });
            }
        }
        sourcingTimer.end();
    });
}
function fetchContentFromManagementApi(gatsbyApi, pluginOptions, reporter) {
    return __awaiter(this, void 0, void 0, function* () {
        const { createNodeId, createContentDigest, actions } = gatsbyApi;
        const { createNode } = actions;
        const sourcingTimer = reporter.activityTimer(`${constants_1.PLUGIN_NAME}: Fetching entities from Yext Management API`);
        sourcingTimer.start();
        let hasNextPage = true;
        let nextPageToken = null;
        while (hasNextPage) {
            const response = yield (0, utils_1.fetchManagementApi)('entities', pluginOptions, nextPageToken);
            const { errors } = response.meta;
            if (errors.length) {
                reporter.panicOnBuild(`${constants_1.PLUGIN_NAME}: Error fetching entities from Yext: ${errors[0].message}`);
                hasNextPage = false;
            }
            else {
                const { entities, pageToken } = response.response;
                if (!pageToken) {
                    hasNextPage = false;
                }
                else {
                    nextPageToken = pageToken;
                }
                (0, lodash_1.forEach)(entities, (entity) => {
                    const nodeType = `Yext${(0, lodash_1.upperFirst)(entity.meta.entityType)}`;
                    const node = Object.assign(Object.assign({}, entity), { id: createNodeId(`${nodeType}-${entity.meta.id}`), parent: null, children: [], internal: {
                            type: nodeType,
                            contentDigest: createContentDigest(entity),
                        } });
                    createNode(node);
                });
            }
        }
        sourcingTimer.end();
    });
}
