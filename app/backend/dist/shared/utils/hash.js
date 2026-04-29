"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeContentHash = computeContentHash;
const crypto_1 = require("crypto");
function computeContentHash(content) {
    const normalized = content.replace(/\r\n/g, '\n').trim();
    return (0, crypto_1.createHash)('sha256').update(normalized, 'utf8').digest('hex');
}
//# sourceMappingURL=hash.js.map