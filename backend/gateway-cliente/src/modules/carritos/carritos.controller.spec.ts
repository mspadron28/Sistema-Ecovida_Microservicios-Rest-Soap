import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { CarritosController } from './carritos.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { AuthGuard, RoleGuard } from '../auth/guards';

describe('CarritosController (e2e)', () => {
  let app: INestApplication;
  let clientProxyMock: Partial<ClientProxy>;

  beforeAll(async () => {
    clientProxyMock = {
      send: jest.fn<any, [any, any]>((pattern, data) => {
        // 📌 CREAR CARRITO
        if (pattern === 'createCarrito') {
          if (JSON.stringify(data.items).includes("' OR '1'='1")) {
            return throwError(() => ({
              status: 400,
              message: 'SQL Injection detected',
            }));
          }
          if (JSON.stringify(data.items).includes('<script>')) {
            return throwError(() => ({
              status: 400,
              message: 'XSS Attack detected',
            }));
          }
          return of({ message: 'Carrito creado exitosamente' });
        }

        // 📌 OBTENER TODOS LOS CARRITOS
        if (pattern === 'findAllCarritos') {
          return of([
            { id_carrito: 1, id_usuario: 'user1', cantidadTotal: 10, precioTotal: 100 },
          ]);
        }

        // 📌 OBTENER CARRITO POR ID USUARIO
        if (pattern === 'findCarritoByUserId') {
          return of({ id_carrito: 1, id_usuario: data, cantidadTotal: 5, precioTotal: 50 });
        }

        // 📌 ELIMINAR ITEM DEL CARRITO
        if (pattern === 'removeCarritoItem') {
          if (data.idProducto === "' OR '1'='1") {
            return throwError(() => ({
              status: 400,
              message: 'SQL Injection detected',
            }));
          }
          if (JSON.stringify(data).includes('<script>')) {
            return throwError(() => ({
              status: 400,
              message: 'XSS Attack detected',
            }));
          }
          return of({ message: 'Producto eliminado del carrito' });
        }

        return throwError(() => ({
          status: 500,
          message: 'Internal Server Error',
        }));
      }),
    };

    // 🔹 Simulación de los Guards (AuthGuard y RoleGuard)
    class MockAuthGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (token === 'valid_token_gestor' || token === 'valid_token_usuario') {
          request.user = {
            id: 'user1',
            role: token === 'valid_token_gestor' ? 'GESTOR_PEDIDOS' : 'USUARIO',
          };
          return true;
        }
        return false;
      }
    }

    class MockRoleGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.user?.role === 'GESTOR_PEDIDOS' || request.user?.role === 'USUARIO';
      }
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CarritosController],
      providers: [{ provide: 'NATS_SERVICE', useValue: clientProxyMock }],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .overrideGuard(RoleGuard)
      .useClass(MockRoleGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 📌 PRUEBAS DE CREACIÓN DE CARRITO
  it('Debe crear un carrito correctamente con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .post('/carritos/crear')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({
        items: [{ idProducto: 6, cantidad: 5 }, { idProducto: 2, cantidad: 5 }],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Carrito creado exitosamente');
      });
  });

  it('Debe rechazar inyección SQL en los productos del carrito', async () => {
    return request(app.getHttpServer())
      .post('/carritos/crear')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({
        items: [{ idProducto: "' OR '1'='1", cantidad: 5 }],
      })
      .expect(500);
  });

  it('Debe rechazar ataque XSS en los productos del carrito', async () => {
    return request(app.getHttpServer())
      .post('/carritos/crear')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({
        items: [{ idProducto: '<script>alert("XSS")</script>', cantidad: 5 }],
      })
      .expect(500);
  });

  // 📌 PRUEBAS DE OBTENCIÓN DE CARRITOS
  it('Debe obtener la lista de carritos con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .get('/carritos/all')
      .set('Authorization', 'Bearer valid_token_gestor')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  it('Debe obtener el carrito de un usuario específico', async () => {
    return request(app.getHttpServer())
      .get('/carritos/user')
      .set('Authorization', 'Bearer valid_token_usuario')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id_carrito');
      });
  });

  // 📌 PRUEBA DE ELIMINACIÓN DE ITEM DEL CARRITO
  it('Debe eliminar un item del carrito correctamente', async () => {
    return request(app.getHttpServer())
      .post('/carritos/eliminar-item')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({ idProducto: 6 })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Producto eliminado del carrito');
      });
  });

  it('Debe rechazar inyección SQL en la eliminación de un item del carrito', async () => {
    return request(app.getHttpServer())
      .post('/carritos/eliminar-item')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({ idProducto: "' OR '1'='1" })
      .expect(500);
  });

  afterAll(async () => {
    await app.close();
  });
});
