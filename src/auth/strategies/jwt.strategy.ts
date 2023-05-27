import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJWTPayload, TokenType } from '../interfaces/auth.interface';
import { JWT_ACCESS_SECRET } from 'src/constant';
import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly dataSource: DataSource) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: IJWTPayload) {
    if (payload.type !== TokenType.ACCESS_TOKEN) throw new UnauthorizedException();

    const user = await this.dataSource.getRepository(User).findOne({ where: { id: payload.sub } });

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
