import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// Configure multer to store files in memory
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// Configure Cloudinary if credentials exist
const hasCloudinary = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a file to Cloudinary or falls back to local storage
 * @param {Object} file Multer file object
 * @param {String} folder Optional folder path
 * @returns {Promise<String>} The public URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'cic_portal') => {
  if (!file) return '';

  if (hasCloudinary) {
    try {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error, falling back to local:', error);
              // Fallback to local on error
              resolve(saveLocalFile(file));
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      console.error('Cloudinary upload exception:', err);
    }
  }

  // Fallback to local file saving
  return saveLocalFile(file);
};

const saveLocalFile = (file) => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);
  
  // Return local server path (handled in server.js to serve static folders)
  return `/uploads/${filename}`;
};
