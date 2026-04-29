"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
exports.buildConnection = buildConnection;
function encodeCursor(id) {
    return Buffer.from(id).toString('base64');
}
function decodeCursor(cursor) {
    return Buffer.from(cursor, 'base64').toString('utf8');
}
function buildConnection(items, totalCount, args) {
    const limit = args.first ?? 50;
    const hasNextPage = items.length > limit;
    const edges = items.slice(0, limit).map((item) => ({
        cursor: encodeCursor(item.id),
        node: item,
    }));
    return {
        edges,
        pageInfo: {
            hasNextPage,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount,
    };
}
//# sourceMappingURL=pagination.js.map