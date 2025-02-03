import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MessagePattern('auth.register.user')
  registerUser(@Payload() registerUser: RegisterUserDto){
    return this.authService.registerUser(registerUser)
  }

  @MessagePattern('auth.login.user')
  loginUser(@Payload() loginUser: LoginUserDto){
    return this.authService.loginUser(loginUser);
  }

  @MessagePattern('auth.verify.user')
  verifyToken(@Payload() token:string){
    return this.authService.verifyToken(token);
  }

  @MessagePattern('auth.getAllUsers')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @MessagePattern('auth.update.user')
  updateUser(@Payload() data: { id: string; updateUserDto: UpdateUserDto }) {
    return this.authService.updateUser(data.id, data.updateUserDto);
  }

   //Toggle para activar/desactivar usuario (Soft Delete)
   @MessagePattern('auth.toggleUserStatus')
   toggleUserStatus(@Payload() id: string) {
     return this.authService.toggleUserStatus(id);
   }

}
