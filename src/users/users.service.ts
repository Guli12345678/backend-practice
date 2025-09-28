import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AllowedRoles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto, requesterRole: AllowedRoles) {
    try {
      const {
        full_name,
        phone,
        email,
        password,
        gender,
        birth_date,
        hashed_refresh_token,
      } = createUserDto;

      if (!password || password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      return this.prisma.user.create({
        data: {
          full_name,
          phone,
          email,
          hashed_password: hashedPassword,
          hashed_refresh_token,
          gender,
          birth_date: new Date(birth_date),
          role: 'USER',
          is_active: false,
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  async createAdmin(createUserDto: CreateUserDto, requesterRole: AllowedRoles) {
    if (requesterRole !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can create ADMIN');
    }

    const {
      full_name,
      phone,
      email,
      password,
      gender,
      birth_date,
      hashed_refresh_token,
    } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        full_name,
        phone,
        email,
        hashed_password: hashedPassword,
        hashed_refresh_token,
        gender,
        birth_date: new Date(birth_date),
        role: 'ADMIN',
        is_active: false,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.update({
      where: { email: newUser.email },
      data: { otp, otpExpiresAt: expiresAt },
    });

    await this.mailService.sendOtp(newUser, otp);

    return {
      message: `Ro'yhatdan o'tdingiz. Akkauntni faollashtirish uchun emailga yuborilgan kodni kiriting.`,
    };
  }

  async findAll(requesterRole: AllowedRoles) {
    if (requesterRole === 'OWNER') {
      return this.prisma.user.findMany();
    }

    if (requesterRole === 'ADMIN') {
      return this.prisma.user.findMany({
        where: {
          NOT: { role: 'OWNER' },
        },
      });
    }

    throw new ForbiddenException('You are not allowed to view users');
  }

  async findOne(id: number, requesterRole: AllowedRoles) {
    if (requesterRole === 'OWNER') {
      return this.prisma.user.findUnique({ where: { id } });
    }

    if (requesterRole === 'ADMIN') {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (user && user.role === 'OWNER') {
        throw new ForbiddenException('Cannot access owner data');
      }
      return user;
    }

    throw new ForbiddenException('Access denied');
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    requesterRole: AllowedRoles,
  ) {
    if (
      updateUserDto.role &&
      updateUserDto.role !== 'USER' &&
      requesterRole !== 'OWNER'
    ) {
      throw new ForbiddenException('Only OWNER can assign roles');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number, requesterRole: AllowedRoles) {
    if (requesterRole !== 'OWNER' && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === 'OWNER') {
      throw new BadRequestException('OWNER cannot be deleted');
    }

    if (requesterRole === 'ADMIN' && user.role === 'ADMIN') {
      throw new ForbiddenException('ADMIN cannot delete other ADMINs');
    }

    await this.prisma.user.delete({ where: { id } });
    return 'User deleted successfully';
  }
}
