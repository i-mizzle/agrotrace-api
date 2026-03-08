import { Response } from "express";

module.exports = (res: Response, error: {message: string, stack: string}) => {
    return res.status(400).send({
        'success': false,
        'errorCode': 'bad-request',
        'message': error.message,
        'stack': error.stack
    });
};
