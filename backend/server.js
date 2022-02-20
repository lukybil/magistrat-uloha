"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var app_1 = __importDefault(require("./app"));
var port = process.env.PORT || 3000;
app_1.default.set('port', port);
var server = http_1.default.createServer(app_1.default);
server.listen(port);
// "prebuild": "tslint -c tslint.json -p tsconfig.json --fix",
