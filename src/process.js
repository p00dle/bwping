"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const win_1 = require("./platforms/win");
function processFactory(config, pingRate) {
    const platform = os.platform();
    switch (platform) {
        case 'win32': return new win_1.WinProcess(config, pingRate);
        default:
            throw Error(`Platform '${platform}' not supported`);
    }
}
exports.processFactory = processFactory;
//# sourceMappingURL=process.js.map