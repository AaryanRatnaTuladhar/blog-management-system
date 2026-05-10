import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto, RegisterDto } from './dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(input.password, 10);
    const user = await this.usersService.createUser(input.email, hash);
    return this.issueToken(user.id, user.email, user.role);
  }

  async login(input: LoginDto) {
    const user = await this.usersService.findByEmail(input.email);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueToken(user.id, user.email, user.role);
  }

  issueToken(userId: string, email: string, role: string) {
    const token = this.jwtService.sign({ sub: userId, email, role });
    return { accessToken: token };
  }
}
