import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { PedidosController } from './pedidos.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { AuthGuard, RoleGuard } from '../auth/guards';

describe('PedidosController (e2e)', () => {
  let app: INestApplication;
  let clientProxyMock: Partial<ClientProxy>;

  beforeAll(async () => {
    clientProxyMock = {
      send: jest.fn<any, [any, any]>((pattern, data) => {
        // 📌 CREAR PEDIDO
        if (pattern === 'createPedido') {
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
          return of({ message: 'Pedido creado exitosamente' });
        }

        // 📌 OBTENER TODOS LOS PEDIDOS
        if (pattern === 'findAllPedidos') {
          return of([
            { id_pedido: 1, id_usuario: 'user1', cantidadTotal: 10, precioTotal: 100, estado: 'PENDIENTE' },
          ]);
        }

        // 📌 VALIDAR PEDIDO
        if (pattern === 'validatePedido') {
          return of({ id_pedido: data });
        }

        // 📌 ACTUALIZAR ESTADO PEDIDO
        if (pattern === 'updatePedidoStatus') {
          return of({ message: `Pedido #${data} marcado como ENVIADO` });
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
      controllers: [PedidosController],
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

  // 📌 PRUEBAS DE CREACIÓN DE PEDIDO
  it('Debe crear un pedido correctamente con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .post('/pedidos/crear')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({
        items: [{ idProducto: 6, cantidad: 1 }, { idProducto: 2, cantidad: 1 }],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Pedido creado exitosamente');
      });
  });

  it('Debe rechazar inyección SQL en los productos del pedido', async () => {
    return request(app.getHttpServer())
      .post('/pedidos/crear')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({
        items: [{ idProducto: "' OR '1'='1", cantidad: 1 }],
      })
      .expect(500);
  });

  it('Debe rechazar ataque XSS en los productos del pedido', async () => {
    return request(app.getHttpServer())
      .post('/pedidos/crear')
      .set('Authorization', 'Bearer valid_token_usuario')
      .send({
        items: [{ idProducto: '<script>alert("XSS")</script>', cantidad: 1 }],
      })
      .expect(500);
  });

  // 📌 PRUEBAS DE OBTENCIÓN DE PEDIDOS
  it('Debe obtener la lista de pedidos con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .get('/pedidos')
      .set('Authorization', 'Bearer valid_token_gestor')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  it('Debe validar un pedido existente', async () => {
    return request(app.getHttpServer())
      .get('/pedidos/validar/1')
      .set('Authorization', 'Bearer valid_token_gestor')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id_pedido');
      });
  });

  // 📌 PRUEBA DE ACTUALIZACIÓN DE ESTADO
  it('Debe actualizar el estado de un pedido a "ENVIADO"', async () => {
    return request(app.getHttpServer())
      .patch('/pedidos/1/enviar')
      .set('Authorization', 'Bearer valid_token_gestor')
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('Pedido #1 marcado como ENVIADO');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
