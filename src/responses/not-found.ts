import { Response } from "express";

module.exports = (res: Response, error: {message: string, stack?: string}) => {    return res.status(404).send({
        'success': false,
        'errorCode': 'not-found',
        'message': error.message
    });
};
