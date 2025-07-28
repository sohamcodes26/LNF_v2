import multer from 'multer';
import { UploadClient } from '@uploadcare/upload-client';
import { Buffer } from 'buffer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('UPLOADCARE_PUBLIC_KEY:', process.env.UPLOADCARE_PUBLIC_KEY);
const client = new UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
  secretKey: process.env.UPLOADCARE_SECRET_KEY,
});
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
const uploadcareStorage = {
  _handleFile: async (req, file, cb) => {
    try {
      console.log('☁️ Using Uploadcare middleware');

      const buffer = await streamToBuffer(file.stream);

      const uploadResponse = await client.uploadFile(buffer, {
        fileName: file.originalname,
        contentType: file.mimetype,
        metadata: {
          subsystem: 'lost-and-found',
          userId: req.id || 'anonymous',
        },
      });

      cb(null, {
        path: uploadResponse.cdnUrl,
        uuid: uploadResponse.uuid,
      });
    } catch (err) {
      console.error('Uploadcare upload error:', err);
      cb(err);
    }
  },

  _removeFile: (req, file, cb) => {
    cb(null);
  },
};

const upload = multer({ storage: uploadcareStorage });

export const uploadCareImage = upload.single('objectImage');
