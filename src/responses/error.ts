'use script';
import { Response } from "express";

module.exports = (res: Response, error: {name?: string, message: string, stack: string}) => {
    return res.status(500).send({
        'success': false,
        'name': error.name,
        'errorCode': 'error',
        'message': error.message,
        'stack': error.stack
    });
};
