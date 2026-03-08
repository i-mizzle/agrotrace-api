import { Response } from "express";

module.exports = (res: Response, error: {message: string, stack: string, code: string}) => {
    return res.status(403).send({
        'success': false,
        'errorCode': error.code || 'forbidden',
        'message': error.message
    });
};
