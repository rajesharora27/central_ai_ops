"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function parseLiteralValue(ast) {
    switch (ast.kind) {
        case graphql_1.Kind.STRING:
            return ast.value;
        case graphql_1.Kind.INT:
            return parseInt(ast.value, 10);
        case graphql_1.Kind.FLOAT:
            return parseFloat(ast.value);
        case graphql_1.Kind.BOOLEAN:
            return ast.value;
        case graphql_1.Kind.NULL:
            return null;
        case graphql_1.Kind.LIST:
            return ast.values.map((v) => parseLiteralValue(v));
        case graphql_1.Kind.OBJECT:
            return Object.fromEntries(ast.fields.map((f) => [f.name.value, parseLiteralValue(f.value)]));
        default:
            return null;
    }
}
const GraphQLJSON = new graphql_1.GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON value',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        return parseLiteralValue(ast);
    },
});
exports.default = GraphQLJSON;
//# sourceMappingURL=json-scalar.js.map