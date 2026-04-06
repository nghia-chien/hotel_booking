import cloudinary from 'cloudinary';
import { Readable } from 'node:stream';

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
if (!CLOUDINARY_URL) {
  throw new Error('CLOUDINARY_URL is not configured');
}

const match = CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
if (!match) {
  throw new Error('Invalid CLOUDINARY_URL format');
}

const [, apiKey, apiSecret, cloudName] = match;

cloudinary.v2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const uploadBufferToCloudinary = async (
  file: Express.Multer.File,
  folder = 'hotel-booking/rooms',
  prefix = 'file'
): Promise<string> => {
  if (!file?.buffer) {
    throw new Error('Missing file buffer for Cloudinary upload');
  }

  const random = Math.round(Math.random() * 1e9);
  const publicId = `${prefix}-${Date.now()}-${random}`;

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result?.secure_url ?? result?.url ?? '');
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};
