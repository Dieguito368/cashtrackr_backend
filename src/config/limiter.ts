import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 60 * 10000,
    limit: process.env.NODE_ENV === "production" ? 5 : 100,
    message: {
        ok: false,
        message: "Haz alcanzado el límite de peticiones al servidor"        
    }
});