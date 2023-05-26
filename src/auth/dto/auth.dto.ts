import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class TraditionalUserLoginDto {
  @ApiProperty({ example: 'pawan@lancemeup.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret@123' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class TraditionalUserRegisterDto extends TraditionalUserLoginDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  full_name: string;
}
