import { Request, Response } from "express";
'use strict';

export const ok = require('./ok');
export const error = require('./error');
export const unAuthorized = require('./unauthorized');
export const created = require('./created');
export const conflict = require('./conflict');
export const badRequest = require('./bad-request');
export const notFound = require('./not-found');
export const forbidden = require('./forbidden');

export const handleErrorResponse = (res: Response, responseObject: any) => {
    switch (responseObject.errorType) {
        case 'badRequest':
            return badRequest(res, {message: responseObject.data})
        case 'conflict':
            return conflict(res, {message: responseObject.data})
        case 'notFound':
            return notFound(res, {message: responseObject.data})
        default:
            return error(res, {message: responseObject.data})
    }
}

export const parseFlutterwaveError = (res: Response, errorString: any) => {
    try {
        const errorData = errorString.data
        errorData.replace(/\\\//g, "");
        const sliced = JSON.parse(errorData.substring(6))
        return error(res, {message: JSON.parse(sliced).message})
    } catch (error: any) {
        return error(res, error)
    }
} 
