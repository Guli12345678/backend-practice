import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInUserDto } from '../users/dto/sign-user.dto';
import { Request, Response } from 'express';
import { VerifyOtpDto } from '../users/dto/verify-otp.dto';
import { AllowedRoles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Check email for OTP.',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async signUpUser(@Body() dto: CreateUserDto) {
    return this.authService.signUpUser(dto, 'USER');
  }

  @Post('user/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshUserToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshUserToken(req, res);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and activate account' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified. Account activated.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Post('user/signin')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: SignInUserDto })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async signInUser(@Body() dto: SignInUserDto, @Res() res: Response) {
    const result = await this.authService.signin(dto, res);
    return res.json(result);
  }

  @Post('user/signout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  async signOutUser(@Body('userId') userId: number, @Res() res: Response) {
    return this.authService.signout(userId, res);
  }
}
