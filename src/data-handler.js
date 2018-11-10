"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = [];
function dataHandlerFactory(period) {
    const periodMs = period * 1000;
    function purgeData() {
        const expireAt = Date.now() - periodMs;
        while (exports.data.length && exports.data[0].timestamp < expireAt) {
            exports.data.shift();
        }
    }
    function dataHandler(pingData) {
        exports.data.push(pingData);
    }
    function getData() {
        purgeData();
        return exports.data;
    }
    return [dataHandler, getData];
}
exports.dataHandlerFactory = dataHandlerFactory;
//# sourceMappingURL=data-handler.js.map