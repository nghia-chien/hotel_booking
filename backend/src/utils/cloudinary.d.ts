/**
 * Uploads a file buffer to Cloudinary and returns the secure URL.
 * @param file - Multer file object with a buffer property
 * @param folder - Cloudinary folder path
 * @param prefix - Public ID prefix
 */
export function uploadBufferToCloudinary(
  file: Express.Multer.File,
  folder?: string,
  prefix?: string
): Promise<string>;
