import { AuthService } from './auth.service';
import { RegisterStudentDto, RegisterTeacherDto, LoginDto, TokenResponseDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerStudent(dto: RegisterStudentDto): Promise<TokenResponseDto>;
    registerTeacher(dto: RegisterTeacherDto): Promise<TokenResponseDto>;
    login(dto: LoginDto): Promise<TokenResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<TokenResponseDto>;
    logout(dto: RefreshTokenDto): Promise<void>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
