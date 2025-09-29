import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInUserDto } from '../users/dto/sign-user.dto';
import { Request, Response } from 'express';
import { VerifyOtpDto } from '../users/dto/verify-otp.dto';
import { AllowedRoles } from '../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { SelfGuard } from '../common/guards/user-self.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { UserPayload } from '../common/types/user-payload';
import { PrismaService } from '../prisma/prisma.service';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by token' })
  @ApiParam({ name: 'id', description: 'User token' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@GetCurrentUserId() userId: number) {
    return this.usersService.findOne(userId);
  }

  @Post('test-error')
  @ApiOperation({ summary: 'Test error handling' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 400, description: 'Test error response' })
  async testError(@Body('errorType') errorType?: string) {
    if (errorType === 'bad-request') {
      throw new BadRequestException('This is a test bad request error');
    }
    if (errorType === 'not-found') {
      throw new NotFoundException('This is a test not found error');
    }
    if (errorType === 'unauthorized') {
      throw new UnauthorizedException('This is a test unauthorized error');
    }
    if (errorType === 'internal') {
      throw new Error('This is a test internal error');
    }
    return { message: 'Error handling test successful', errorType };
  }
}
