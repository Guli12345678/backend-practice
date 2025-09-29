import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { User } from '../../generated/prisma';
import { JwtPayload, ResponseFields, Tokens } from '../common/types';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { randomUUID } from 'crypto';
import { SignInUserDto } from '../users/dto/sign-user.dto';
import { Request, Response } from 'express';
import { AllowedRoles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async generateTokensuser(user: User): Promise<Tokens> {
    const payload: JwtPayload = {
      id: Number(user.id),
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.SECRET_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async signUpUser(createUserDto: CreateUserDto, requesterRole: AllowedRoles) {
    try {
      const candidate = await this.prismaService.user
        .findUnique({ where: { email: createUserDto.email } })
        .catch(() => null);

      if (candidate) throw new ConflictException('User already exists');

      const activationLink = randomUUID();

      const newUser = await this.usersService.create(
        { ...createUserDto, activation_link: activationLink },
        requesterRole,
      );

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await this.prismaService.user.update({
        where: { email: newUser.email },
        data: { otp, otpExpiresAt: expiresAt },
      });

      await this.mailService.sendOtp(newUser, otp);

      return {
        message: `Ro'yhatdan o'tdingiz. Akkauntni faollashtirish uchun emailga yuborilgan kodni kiriting.`,
      };
    } catch (error) {
      console.error('Error in signUpUser:', error);
      throw error;
    }
  }

  async verifyOtp(email: string, submittedOtp: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otpExpiresAt) {
      throw new BadRequestException('OTP not found or expired');
    }

    const now = new Date();
    if (user.otp !== submittedOtp || now > user.otpExpiresAt) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prismaService.user.update({
      where: { email },
      data: {
        is_active: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'OTP verified. Account activated.' };
  }

  async signin(
    signInUserDto: SignInUserDto,
    res: Response,
  ): Promise<ResponseFields> {
    try {
      const { email, password } = signInUserDto;
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) throw new NotFoundException('User not found');

      const isValid = await bcrypt.compare(password, user.hashed_password);
      if (!isValid)
        throw new UnauthorizedException('Email or password is incorrect');

      const { accessToken, refreshToken } = await this.generateTokensuser(user);
      if (!refreshToken)
        throw new UnauthorizedException('Refresh token generation failed');

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { hashed_refresh_token: hashedRefreshToken },
      });

      res.cookie('refreshToken', refreshToken, {
        maxAge: +process.env.COOKIE_TIME!,
        httpOnly: true,
      });

      return {
        message: 'User signed in 🎉',
        userId: Number(user.id),
        accessToken,
      };
    } catch (error) {
      console.error('Error in signin:', error);
      throw error;
    }
  }

  async signout(userId: number, res: Response) {
    await this.prismaService.user.updateMany({
      where: { id: userId, hashed_refresh_token: { not: null } },
      data: { hashed_refresh_token: null },
    });

    res.clearCookie('refreshToken');
    return true;
  }

  

  async refreshUserToken(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const decoded = this.jwtService.decode(refreshToken) as JwtPayload;
    const userId = decoded?.id;
    if (!userId) throw new UnauthorizedException('Invalid token payload');

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !user.hashed_refresh_token) {
      throw new UnauthorizedException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.hashed_refresh_token,
    );
    if (!rtMatches) throw new ForbiddenException('Invalid refresh token');

    const tokens = await this.generateTokensuser(user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashed_refresh_token },
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.json({
      message: 'User accessToken refreshed',
      userId: Number(user.id),
      accessToken: tokens.accessToken,
    });
  }

  async getMe(token: string) {
    
  }
}
