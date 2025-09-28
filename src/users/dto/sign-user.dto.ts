import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class SignInUserDto {
  @ApiProperty({ example: "guli@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "StrongP@ssw0rd!" })
  @IsString()
  password: string;
}
