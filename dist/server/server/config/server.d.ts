export declare const serverConfig: {
    port: string | number;
    host: string;
    cors: {
        origin: string[];
        credentials: boolean;
    };
    limits: {
        json: string;
        urlencoded: string;
    };
    static: {
        maxAge: string;
    };
    security: {
        rateLimit: {
            windowMs: number;
            max: number;
        };
    };
};
export declare const paths: {
    storage: {
        midi: string;
        voices: string;
        music: string;
        temp: string;
    };
    static: {
        client: string;
        uploads: string;
    };
};
