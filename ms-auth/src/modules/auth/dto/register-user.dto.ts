import { IsEmail, IsOptional, IsString, IsStrongPassword, IsArray } from "class-validator";

export class RegisterUserDto {
    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;

    @IsArray()
    @IsString({ each: true })
    roles?: string[];
}
