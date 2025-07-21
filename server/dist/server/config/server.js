export const serverConfig = {
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    cors: {
        origin: process.env.NODE_ENV === 'production' ?
            ['https://burntbeats.replit.app', 'https://burnt-beats.replit.app'] :
            ['http://localhost:3000', 'http://localhost:5000', 'http://0.0.0.0:3000', 'http://0.0.0.0:5000'],
        credentials: true
    },
    limits: {
        json: '50mb',
        urlencoded: '50mb'
    },
    static: {
        maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
    },
    security: {
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    }
};
export const paths = {
    storage: {
        midi: './storage/midi',
        voices: './storage/voices',
        music: './storage/music',
        temp: './storage/temp'
    },
    static: {
        client: '../dist/public',
        uploads: './storage'
    }
};
//# sourceMappingURL=server.js.map