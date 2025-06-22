"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
const filename_1 = require("../../utils/filename");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const IMAGE_OPTIONS = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
    format: 'webp',
};
class S3Service {
    async uploadImage(file, retries = 3) {
        try {
            const processedImage = await this.processImage(file);
            const fileName = (0, filename_1.generateUniqueFilename)(file.originalname, IMAGE_OPTIONS.format);
            await s3.send(new client_s3_1.PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: fileName,
                Body: processedImage,
                ContentType: `image/${IMAGE_OPTIONS.format}`
            }));
            return this.getPublicUrl(fileName);
        }
        catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
                return this.uploadImage(file, retries - 1);
            }
            throw error;
        }
    }
    async uploadMultipleImages(files, concurrency = 5) {
        const results = [];
        for (let i = 0; i < files.length; i += concurrency) {
            const batch = files.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(file => this.uploadImage(file)));
            results.push(...batchResults);
        }
        return results;
    }
    async processImage(file) {
        return (0, sharp_1.default)(file.buffer)
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
    getPublicUrl(fileName) {
        return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
//# sourceMappingURL=s3BucketService.js.map