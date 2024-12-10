import { IsEmail, IsString, IsStrongPassword, Matches } from "class-validator";

export class LoginUserDto {

    @IsString()
    @IsEmail()
    @Matches(/^[a-zA-Z0-9@._-]+$/, {
      message: 'El correo electrónico contiene caracteres no permitidos.',
    })
    email: string;
  
    @IsString()
    @IsStrongPassword()
    @Matches(/^[^\s'";<>]*$/, {
      message: 'La contraseña contiene caracteres no permitidos.',
    })
    password: string;


    
}