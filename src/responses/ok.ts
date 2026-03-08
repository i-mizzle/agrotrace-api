'use script';
import { Response } from "express";

module.exports = (res: Response, data: {}) => {
    return res.status(200).send({
        'success': true,
        'data': data
    });
};
