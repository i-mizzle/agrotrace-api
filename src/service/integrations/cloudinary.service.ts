
import config from "config";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Request } from "express";

type CloudinaryConfig = {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
};

const cloudinaryConfig = config.get<CloudinaryConfig>("cloudinary");

cloudinary.config({ 
    cloud_name: cloudinaryConfig.CLOUD_NAME,
    api_key: cloudinaryConfig.API_KEY,
    api_secret: cloudinaryConfig.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: () => ({
        folder: "agrotrace-assets",
    }),
});

export const upload = multer({ storage: storage });

export const uploadMultiple = multer({ storage }).array('files');

export interface MulterRequest extends Request {
    file: any;
}

export interface MulterMultipleRequest extends Request {
    files: any;
}
