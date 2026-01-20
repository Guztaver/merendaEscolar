import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() signInDto: Record<string, any>) {
        const user = await this.authService.validateUser(signInDto.email, signInDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user); // user here is the result of validateUser (stripped password)
        // Wait, validateUser returns entity minus password, but login expects { email, id }
        // validateUser returns result which is user object without password.
        // I should cast or ensure it has id and email.
    }

    @Post('register')
    async register(@Body() createUserDto: Partial<User>) {
        return this.authService.register(createUserDto);
    }
}
