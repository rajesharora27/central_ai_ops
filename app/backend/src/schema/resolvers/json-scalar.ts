import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

function parseLiteralValue(ast: ValueNode): unknown {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return ast.values.map((v) => parseLiteralValue(v));
    case Kind.OBJECT:
      return Object.fromEntries(
        ast.fields.map((f) => [f.name.value, parseLiteralValue(f.value)])
      );
    default:
      return null;
  }
}

const GraphQLJSON = new GraphQLScalarType({
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

export default GraphQLJSON;
