"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = exports.passwordSchema = exports.usernameSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
// Email validation schema
exports.emailSchema = zod_1.z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform(s => s.toLowerCase().trim());
// Username validation schema
exports.usernameSchema = zod_1.z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .transform(s => s.toLowerCase().trim());
// Password validation schema - must be at least 5 characters with any 2 of: letters, numbers, or symbols
exports.passwordSchema = zod_1.z
    .string()
    .min(5, "Password must be at least 5 characters")
    .refine((password) => {
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const typeCount = [hasLetters, hasNumbers, hasSymbols].filter(Boolean).length;
    return typeCount >= 2;
}, {
    message: "Password must contain at least 2 of: letters, numbers, or symbols"
});
// Login schema
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, "Password is required"),
});
// Registration schema
exports.registerSchema = zod_1.z.object({
    username: exports.usernameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Password reset request schema
exports.forgotPasswordSchema = zod_1.z.object({
    email: exports.emailSchema,
});
// Password reset schema
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Reset token is required"),
    password: exports.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
