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
exports.fetchContent = exports.fetchFolders = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const headers = {
    "Content-Type": `application/json`,
};
function fetchFolders(pluginOptions, pageToken = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const { apiKey, accountId, apiVersion } = pluginOptions;
        const url = `https://api.yextapis.com/v2/accounts/${accountId}/folders?api_key=${apiKey}&v=${apiVersion}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const response = yield (0, node_fetch_1.default)(url, {
            method: `GET`,
            headers,
        });
        return yield response.json();
    });
}
exports.fetchFolders = fetchFolders;
function fetchContent(pluginOptions, pageToken = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const { apiKey, accountId, apiVersion, entityTypes } = pluginOptions;
        const url = `https://api.yextapis.com/v2/accounts/${accountId}/entities?api_key=${apiKey}&v=${apiVersion}&entityTypes=${entityTypes.join(',')}${pluginOptions.pageLimit ? `&limit=${pluginOptions.pageLimit}` : ''}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const response = yield (0, node_fetch_1.default)(url, {
            method: `GET`,
            headers,
        });
        return yield response.json();
    });
}
exports.fetchContent = fetchContent;
