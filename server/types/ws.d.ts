declare module 'ws' {
  import { EventEmitter } from 'events';
  import { IncomingMessage, Server as HttpServer } from 'http';
  import { Server as HttpsServer } from 'https';
  import { Socket } from 'net';

  class WebSocket extends EventEmitter {
    constructor(address?: string | URL, protocols?: string | string[], options?: any);
    static readonly CONNECTING: 0;
    static readonly OPEN: 1;
    static readonly CLOSING: 2;
    static readonly CLOSED: 3;
    
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSING: 2;
    readonly CLOSED: 3;
    
    readyState: 0 | 1 | 2 | 3;
    url?: string;
    protocol?: string;
    
    close(code?: number, reason?: string): void;
    ping(data?: any, mask?: boolean, callback?: (error: Error) => void): void;
    pong(data?: any, mask?: boolean, callback?: (error: Error) => void): void;
    send(data: any, callback?: (error?: Error) => void): void;
    send(data: any, options: any, callback?: (error?: Error) => void): void;
    terminate(): void;
    
    addEventListener(event: string, listener: (...args: any[]) => void): void;
    removeEventListener(event: string, listener: (...args: any[]) => void): void;
    
    on(event: 'close', listener: (code: number, reason: string) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'message', listener: (data: any) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: 'ping' | 'pong', listener: (data: Buffer) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  class Server extends EventEmitter {
    constructor(options?: any, callback?: () => void);
    close(callback?: (error?: Error) => void): void;
    handleUpgrade(
      request: IncomingMessage,
      socket: Socket,
      upgradeHead: Buffer,
      callback: (client: WebSocket, request: IncomingMessage) => void
    ): void;
    shouldHandle(request: IncomingMessage): boolean;
  }

  export = WebSocket;
}