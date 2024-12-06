import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../lib/roles.enum';
  
  @Injectable()
  export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      // Obtener los roles requeridos desde el decorador
      const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
      if (!requiredRoles) {
        return true; // Si no se definen roles, la ruta es pública
      }
  
      // Obtener el usuario desde la solicitud
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user || !user.roles) {
        return false; // No hay usuario autenticado o no tiene roles asignados
      }

      
      // Verificar si el usuario tiene al menos uno de los roles requeridos
      return  requiredRoles.every((requiredRole) => user.roles.includes(requiredRole as string));
    }
  }
  