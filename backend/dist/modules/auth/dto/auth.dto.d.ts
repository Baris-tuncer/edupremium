export declare class RegisterStudentDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    gradeLevel?: number;
    schoolName?: string;
    parentName?: string;
    parentEmail?: string;
    parentPhone?: string;
}
export declare class RegisterTeacherDto {
    email: string;
    password: string;
    invitationCode: string;
    firstName: string;
    lastName: string;
    phone?: string;
    branchId: string;
    introVideoUrl: string;
    bio?: string;
    hourlyRate: number;
    iban?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class TokenResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
