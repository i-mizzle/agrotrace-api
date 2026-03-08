import { Response } from "express";

module.exports = (res: Response, error: {message: string, stack: string}) => {
    return res.status(409).send({
        'success': false,
        'errorCode': 'conflict',
        'message': error.message,
        'stack': error.stack
    });
};
