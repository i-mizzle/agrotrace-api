// service/qrcode.service.ts
import dotenv from 'dotenv';
dotenv.config();

import { Readable } from 'stream';
import QRCode from 'qrcode'
import cloudinary from 'cloudinary'
import mongoose from 'mongoose'
import { findAndUpdateQrTrace } from './qr-trace.service';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  })
}

export const generateAndUploadQRCode = async (traceId: string, data: {traceUrl: string}) => {
  try {
    console.log('generateAndUploadQRCode received traceId:', traceId, 'type:', typeof traceId)

    const traceIdString = traceId?.toString();
    if (!traceIdString || !mongoose.Types.ObjectId.isValid(traceIdString)) {
      throw new Error('Invalid traceId passed to QR generator: ' + traceId)
    }

    const objectId = new mongoose.Types.ObjectId(traceIdString)

    if (!data?.traceUrl) {
      throw new Error('Missing traceUrl in QR job payload')
    }

    console.log('Generating QR image for:', data.traceUrl)
    const qrBuffer = await QRCode.toBuffer(data.traceUrl, {
      width: 512,
      margin: 0,
      scale: 4,
      errorCorrectionLevel: 'H',
    })

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
    }

    console.log('Uploading QR image to Cloudinary for trace:', traceIdString)
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'agrotrace-assets/qr-codes',
          public_id: `qr-${Date.now()}-${traceIdString}`,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error)
            return
          }
          resolve(result)
        }
      )

      Readable.from(qrBuffer).pipe(uploadStream)
    })

    console.log('Updating QR trace document:', traceIdString)
    const updatedQRTrace = await findAndUpdateQrTrace(
      { _id: objectId },
      {
        traceUrl: data.traceUrl,
        qrCode: uploadResponse.secure_url
      },
      { new: true }
    )

    if (!updatedQRTrace || (updatedQRTrace as any).error) {
      console.error('findAndUpdateQrTrace returned null or error for id:', traceIdString)
      throw new Error('QR trace not found or error when updating QR code (id: ' + traceIdString + ')')
    }

    if ((updatedQRTrace as any)._id) {
      console.log('QR trace updated OK:', (updatedQRTrace as any)._id)
    } else {
      console.log('QR trace updated OK, but _id not present:', updatedQRTrace)
    }

    return uploadResponse.secure_url
  } catch (err: any) {
    console.error('QR code generation failed at step:', err?.message || err)
    throw err
  }
}
