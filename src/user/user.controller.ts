import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../@guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  myProfile(@GetUser() user: User) {
    return user;
  }
}
