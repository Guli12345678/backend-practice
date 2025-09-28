import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../../generated/prisma';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(user: User, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Your Clinic Service OTP Code',
        html: `<html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>OTP Verification</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background-color: #fff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #007bff;
              }
              .otp {
                font-size: 24px;
                font-weight: bold;
                background-color: #f0f0f0;
                padding: 10px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
              }
              p {
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Hello, ${user.full_name} 👋</h1>
              <p>Your OTP code for Clinic Service is:</p>
              <div class="otp">${otp}</div>
              <p>This code is valid for a limited time. Please do not share it with anyone.</p>
              <hr />
              <small>This email was sent by Clinic Service App.</small>
            </div>
          </body>
        </html>`,
      });
    } catch (error) {
      console.error(`Failed to send OTP to ${user.email}:`, error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
