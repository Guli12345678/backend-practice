import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageUploadService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'products');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveImage(base64Data: string, originalName?: string): Promise<string> {
    if (!base64Data || typeof base64Data !== 'string') {
      throw new BadRequestException(
        'Image data is required and must be a string',
      );
    }

    if (!base64Data.includes('data:image/')) {
      throw new BadRequestException(
        'Invalid image format. Must be a valid base64 image data URL',
      );
    }

    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) {
      throw new BadRequestException('Invalid base64 image data format');
    }

    const fileExtension =
      this.getFileExtension(originalName) ||
      this.getExtensionFromBase64(base64Data) ||
      'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    try {
      fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
      return fileName;
    } catch (error) {
      console.error('Failed to save image:', error);
      throw new InternalServerErrorException(
        `Failed to save image: ${error.message}`,
      );
    }
  }

  async deleteImage(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadPath, fileName);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  private getFileExtension(originalName?: string): string | null {
    if (!originalName) return null;
    const parts = originalName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
  }

  private getExtensionFromBase64(base64Data: string): string | null {
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    for (const ext of validExtensions) {
      if (base64Data.startsWith('/9j/') && (ext === 'jpg' || ext === 'jpeg'))
        return 'jpg';
      if (base64Data.startsWith('iVBORw0KGgo') && ext === 'png') return 'png';
      if (base64Data.startsWith('R0lGOD') && ext === 'gif') return 'gif';
      if (base64Data.startsWith('UklGR') && ext === 'webp') return 'webp';
    }
    return null;
  }

  getImageUrl(fileName: string): string {
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }
    return `/uploads/products/${fileName}`;
  }
}
