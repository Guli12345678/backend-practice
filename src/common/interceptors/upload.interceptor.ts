import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as multer from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadInterceptor implements NestInterceptor {
  private multer = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, './uploads/products');
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return new Observable((observer) => {
      this.multer.single('image')(request, response, (err) => {
        if (err) {
          observer.error(err);
          return;
        }

        if (request.file) {
          request.imageUrl = `/uploads/products/${request.file.filename}`;
        }

        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
