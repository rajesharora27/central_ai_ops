export type PaginationArgs = {
  first?: number | null;
  after?: string | null;
};

export type Edge<T> = {
  cursor: string;
  node: T;
};

export type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
};

export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf8');
}

export function buildConnection<T extends { id: string }>(
  items: T[],
  totalCount: number,
  args: PaginationArgs
): Connection<T> {
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
