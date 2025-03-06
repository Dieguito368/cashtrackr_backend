import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 60 * 10000,
    limit: 5,
    message: {
        ok: false,
        message: "Haz alcanzado el límite de peticiones al servidor"        
    }
}); 