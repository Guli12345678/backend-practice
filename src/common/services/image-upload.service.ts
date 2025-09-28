import { Injectable } from '@nestjs/common';
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
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) {
      throw new Error('Invalid base64 image data');
    }

    const fileExtension = this.getFileExtension(originalName) || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    try {
      fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
      return fileName;
    } catch (error) {
      throw new Error('Failed to save image');
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

  getImageUrl(fileName: string): string {
    return `/uploads/products/${fileName}`;
  }
}
