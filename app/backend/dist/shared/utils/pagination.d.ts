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
export declare function encodeCursor(id: string): string;
export declare function decodeCursor(cursor: string): string;
export declare function buildConnection<T extends {
    id: string;
}>(items: T[], totalCount: number, args: PaginationArgs): Connection<T>;
//# sourceMappingURL=pagination.d.ts.map