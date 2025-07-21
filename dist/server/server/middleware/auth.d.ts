export declare const validatePassword: (password: string) => boolean;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
export declare const sessionConfig: {
    name: string;
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
        secure: boolean;
        httpOnly: boolean;
        maxAge: number;
        sameSite: "strict";
    };
};
export declare const trackLoginAttempt: (ip: string) => boolean;
export declare const resetLoginAttempts: (ip: string) => void;
