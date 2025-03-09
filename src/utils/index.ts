import type { Response } from "express"

export const sendErrorResponse = (
    res: Response, 
    status: number,
    message: string,
) => {
    const error = new Error(message);

    res.status(status).json({ ok: false, message: error.message });
}