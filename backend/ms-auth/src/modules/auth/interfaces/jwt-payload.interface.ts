export interface JwtPayload {
    id: string;
    email: string;
    nombre: string;
    roles: string[]; // Lista de IDs de roles
}
