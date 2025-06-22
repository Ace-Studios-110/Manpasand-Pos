import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { generateUniqueFilename } from '../../utils/filename';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const IMAGE_OPTIONS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 80,
  format: 'webp' as const,
};

export class S3Service {
  async uploadImage(file: Express.Multer.File, retries = 3): Promise<string> {
    try {
      const processedImage = await this.processImage(file);
      const fileName = generateUniqueFilename(file.originalname, IMAGE_OPTIONS.format);

      await s3.send(new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: processedImage,
        ContentType: `image/${IMAGE_OPTIONS.format}`
      }));

      return this.getPublicUrl(fileName);
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        return this.uploadImage(file, retries - 1);
      }
      throw error;
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], concurrency = 5): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(file => this.uploadImage(file))
      );
      results.push(...batchResults);
    }

    return results;
  }

  private async processImage(file: Express.Multer.File): Promise<Buffer> {
    return sharp(file.buffer)
      .resize({
        width: IMAGE_OPTIONS.maxWidth,
        height: IMAGE_OPTIONS.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(IMAGE_OPTIONS.format, {
        quality: IMAGE_OPTIONS.quality
      })
      .toBuffer();
  }

  private getPublicUrl(fileName: string): string {
    return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }
}

export const s3Service = new S3Service();