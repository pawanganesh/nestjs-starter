import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/repositories/user.repository';
import {
  TraditionalUserLoginDto,
  TraditionalUserRegisterDto,
} from './dto/auth.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async createUser(payload: TraditionalUserRegisterDto) {
    const user = new User();

    user.full_name = payload.full_name;
    user.email = payload.email;
    user.password = payload.password;

    await this.userRepository.save(user);

    return { success: true, message: 'User created.' };
  }

  async loginUser(payload: TraditionalUserLoginDto) {}
}
