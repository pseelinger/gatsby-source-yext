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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForImageFields = exports.entityNodeFormatter = exports.fetchManagementApi = exports.fetchContent = void 0;
const gatsby_source_filesystem_1 = require("gatsby-source-filesystem");
const lodash_1 = require("lodash");
const node_fetch_1 = __importDefault(require("node-fetch"));
const headers = {
    "Content-Type": `application/json`,
};
/**
 * Fetch utility for requests to the Yext api.
 */
function fetchContent(contentEndpoint, pluginOptions, pageToken = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const { apiKey, accountId, apiVersion } = pluginOptions;
        const url = `https://cdn.yextapis.com/v2/accounts/${accountId}/content/${contentEndpoint}?api_key=${apiKey}&v=${apiVersion}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const response = yield (0, node_fetch_1.default)(url, {
            method: `GET`,
            headers,
        });
        return yield response.json();
    });
}
exports.fetchContent = fetchContent;
function fetchManagementApi(contentType, pluginOptions, pageToken = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const { apiKey, accountId, apiVersion } = pluginOptions;
        const url = `https://api.yextapis.com/v2/accounts/${accountId}/${contentType}?api_key=${apiKey}&v=${apiVersion}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const response = yield (0, node_fetch_1.default)(url, {
            method: `GET`,
            headers,
        });
        return yield response.json();
    });
}
exports.fetchManagementApi = fetchManagementApi;
function isYextPhotoField(value) {
    if (!value) {
        return false;
    }
    return value.url !== undefined;
}
function entityNodeFormatter(entity, gatsbyApi) {
    return __awaiter(this, void 0, void 0, function* () {
        const { createNodeId, createContentDigest, actions: { createNode } } = gatsbyApi;
        const nodeType = `Yext${(0, lodash_1.upperFirst)(entity.meta.entityType.id)}`;
        createNode(Object.assign(Object.assign({}, entity), { id: createNodeId(`${nodeType}-${entity.id}`), parent: null, children: [], internal: {
                type: nodeType,
                contentDigest: createContentDigest(entity),
            } }));
    });
}
exports.entityNodeFormatter = entityNodeFormatter;
function checkForImageFields(node, createNodeField, createNodeId, getCache, createNode) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all((0, lodash_1.forEach)((0, lodash_1.keys)(node), (key) => __awaiter(this, void 0, void 0, function* () {
            if (isImageFieldOrArrayOfImageFields(node[key])) {
                yield createImageField(node, key, createNodeField, createNodeId, getCache, createNode);
            }
            if ((0, lodash_1.isObject)(node[key])) {
                yield Promise.all((0, lodash_1.forEach)((0, lodash_1.keys)(node[key]), (objectKey) => __awaiter(this, void 0, void 0, function* () {
                    yield checkForImageFields(node[key][objectKey], createNodeField, createNodeId, getCache, createNode);
                })));
            }
        })));
    });
}
exports.checkForImageFields = checkForImageFields;
function createImageField(node, key, createNodeField, createNodeId, getCache, createNode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (node[key]) {
            if ((0, lodash_1.isArray)(node[key])) {
                let images = yield Promise.all((0, lodash_1.map)(node[key], ({ image }) => __awaiter(this, void 0, void 0, function* () {
                    return yield createImageFileNode(image, node, createNodeId, getCache, createNode);
                })));
                if (images) {
                    createNodeField({
                        node,
                        name: node[key],
                        value: (0, lodash_1.map)(images, 'id')
                    });
                }
            }
            else {
                let image = yield createImageFileNode(node[key], node, createNodeId, getCache, createNode);
                if (image) {
                    createNodeField({
                        node,
                        name: node[key],
                        value: image
                    });
                }
            }
        }
    });
}
function createImageFileNode(image, node, createNodeId, getCache, createNode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield (0, gatsby_source_filesystem_1.createRemoteFileNode)({
                url: image.url,
                parentNodeId: node.id,
                createNode,
                createNodeId,
                getCache
            });
        }
        catch (e) {
            console.error(e);
            return null;
        }
    });
}
function isImageFieldOrArrayOfImageFields(value) {
    if (isYextPhotoField(value)) {
        return true;
    }
    if ((0, lodash_1.isArray)(value)) {
        let isArrayOfImages = false;
        (0, lodash_1.forEach)(value, singleValue => {
            if (isImageFieldOrArrayOfImageFields(singleValue)) {
                isArrayOfImages = true;
            }
        });
        return isArrayOfImages;
    }
    return false;
}
