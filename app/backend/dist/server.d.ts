declare function createApp(): Promise<{
    app: import("express-serve-static-core").Express;
    httpServer: import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
    shutdown: (signal: string) => Promise<void>;
}>;
export { createApp };
//# sourceMappingURL=server.d.ts.map