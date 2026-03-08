
const config = require("config")
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
import multer from "multer";

cloudinary.config({ 
    cloud_name: config.cloudinary.CLOUD_NAME, 
    api_key: config.cloudinary.API_KEY, 
    api_secret: config.cloudinary.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "scanserve-assets",
    },
});

export const upload = multer({ storage: storage });

export const uploadMultiple = multer({ storage }).array('files');

export interface MulterRequest extends Request {
    file: any;
}

export interface MulterMultipleRequest extends Request {
    files: any;
}
