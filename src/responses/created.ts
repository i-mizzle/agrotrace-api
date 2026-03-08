import { Response } from "express";

module.exports = (res: Response, body: {}) => {
    return res.status(201).send({
        'success': true,
        'data': body
    });
};
