import { Server } from 'http';
export declare class GracefulShutdown {
    private server;
    private healthChecker;
    private shutdownTimeout;
    private isShuttingDown;
    constructor(server: Server);
    private setupSignalHandlers;
    private shutdown;
    private waitForActiveConnections;
    private cleanup;
    private forceShutdown;
}
export default GracefulShutdown;
