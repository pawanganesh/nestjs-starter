import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class EmailDto {
  @ApiProperty({ example: 'pawan@lancemeup.com' })
  @IsEmail()
  email: string;
}

export class TraditionalUserLoginDto extends EmailDto {
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

export class RefreshAccessTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGJjNDFlNC0yMjZhLTRjZjktOTI0OS1kZDk5ZjlkODg5Y2YiLCJ0eXBlIjoiUkVGUkVTSF9UT0tFTiIsImlhdCI6MTY4NTE3NTk4NSwiZXhwIjoxNjg1NzgwNzg1fQ.-YhYqnJ2igSqlpnW0YYFLPMnbqC3cOW0ajUmUXX8PxQ',
  })
  @IsString()
  refresh_token: string;
}

export class VerificationDto extends EmailDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({ example: '123456' })
  code: string;
}

export class RequestVerificationDto extends EmailDto {}
