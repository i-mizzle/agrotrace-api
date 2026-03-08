import { Request, Response } from 'express'
import { get } from "lodash";
import * as response from '../responses'
import { MulterMultipleRequest, MulterRequest } from '../service/integrations/cloudinary.service';

export const newFileHandler = async (req: Request, res: Response) => {
    try {
        if(!req.file) {
            return response.badRequest(res, { message: 'No file received' })
        }
        return response.created(res, { 
            file: (req as unknown as MulterRequest).file.path
        })
    } catch (error:any) {
        return response.error(res, error)
    } 
}

export const newFilesHandler = async (req: Request, res: Response) => {
    try {
        if(!req.files) {
            return response.badRequest(res, { message: 'an array of files (files) is expected, none received' })
        }

        const fileUrls = (req as unknown as MulterMultipleRequest).files.map((file: any) => file.path);
        // return res.status(200).json({ fileUrls });
        return response.created(res, { 
            files: fileUrls
        })
    } catch (error:any) {
        return response.error(res, error)
    } 
}