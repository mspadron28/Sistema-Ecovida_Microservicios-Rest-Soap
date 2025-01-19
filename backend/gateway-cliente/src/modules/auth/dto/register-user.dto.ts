import { 
    IsEmail, 
    IsOptional, 
    IsString, 
    IsStrongPassword, 
    IsArray, 
    Matches 
  } from "class-validator";
  
  export class RegisterUserDto {
    @IsString()
    @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ._,-]+$/, {
      message: 'El nombre contiene caracteres no permitidos.',
    })
    name: string;
  
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
  
    @IsArray()
    @IsString({ each: true })
    @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ._,-]+$/, {
      each: true,
      message: 'Uno o más roles contienen caracteres no permitidos.',
    })
    roles?: string[];
  }
  