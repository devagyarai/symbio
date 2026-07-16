import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, InternalServerError } from 'errors';

const prisma = new PrismaClient();

// Configuration is automatically pulled from CLOUDINARY_URL in .env
// We can explicitly configure it if CLOUDINARY_URL isn't sufficient
cloudinary.config({
  secure: true,
});

export class UploadService {
  /**
   * Upload an image to Cloudinary and create a FileAsset record.
   */
  static async uploadImage(
    file: Express.Multer.File,
    workspaceId: string,
    userId: string
  ) {
    // 1. Upload to Cloudinary using stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `symbio/workspaces/${workspaceId}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      
      uploadStream.end(file.buffer);
    }).catch(error => {
      throw new InternalServerError(`Cloudinary upload failed: ${error.message}`);
    });

    // 2. Save record in database
    const fileAsset = await prisma.fileAsset.create({
      data: {
        workspaceId,
        uploadedBy: userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        cloudinaryPublicId: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    return fileAsset;
  }

  /**
   * Delete an image from Cloudinary and remove its FileAsset record.
   */
  static async deleteImage(fileAssetId: string, workspaceId: string) {
    // 1. Find the asset in the database and ensure it belongs to the workspace
    const fileAsset = await prisma.fileAsset.findUnique({
      where: { id: fileAssetId },
    });

    if (!fileAsset || fileAsset.workspaceId !== workspaceId) {
      throw new NotFoundError('File not found in this workspace');
    }

    // 2. Delete from Cloudinary
    await cloudinary.uploader.destroy(fileAsset.cloudinaryPublicId).catch(error => {
      throw new InternalServerError(`Cloudinary delete failed: ${error.message}`);
    });

    // 3. Delete from database
    await prisma.fileAsset.delete({
      where: { id: fileAssetId },
    });

    return { success: true };
  }
}
