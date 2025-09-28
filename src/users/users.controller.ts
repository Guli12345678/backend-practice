import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AllowedRoles, Roles } from '../common/decorators/roles.decorator';
import { SelfGuard } from '../common/guards/user-self.guard';
import { Request } from 'express';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { UserPayload } from '../common/types/user-payload';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

interface Re extends Request {
  user?: {
    id: number;
    email: string;
    role: AllowedRoles;
  };
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users (Admin/Owner only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Admin/Owner role required.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  findAll(@GetCurrentUser() user: UserPayload) {
    return this.usersService.findAll(user.role);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post('create-admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create admin user (Owner only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Owner role required.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  createAdmin(
    @Body() createUserDto: CreateUserDto,
    @GetCurrentUser() user: UserPayload,
  ) {
    return this.usersService.createAdmin(createUserDto, user.role);
  }

  @Post()
  @ApiOperation({ summary: 'Create regular user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, 'USER');
  }

  @UseGuards(AuthGuard, SelfGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID ' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Admin/Owner role required.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @GetCurrentUser() user: UserPayload) {
    return this.usersService.findOne(+id, user.role);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user (Admin/Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Admin/Owner role required.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 400, description: 'Cannot delete owner or admin' })
  remove(@Param('id') id: string, @GetCurrentUser() user: UserPayload) {
    return this.usersService.remove(+id, user.role);
  }

  @UseGuards(AuthGuard, SelfGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user (Self only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Can only update own data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetCurrentUser() user: UserPayload,
  ) {
    return this.usersService.update(+id, updateUserDto, user.role);
  }
}
