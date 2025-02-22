import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { EnviosController } from './envios.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { AuthGuard, RoleGuard } from '../auth/guards';

describe('EnviosController (e2e)', () => {
  let app: INestApplication;
  let clientProxyMock: Partial<ClientProxy>;

  beforeAll(async () => {
    clientProxyMock = {
      send: jest.fn<any, [any, any]>((pattern, data) => {
        // 📌 CREAR ENVÍO
        if (pattern === 'createEnvio') {
          if (JSON.stringify(data).includes("' OR '1'='1")) {
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
          return of({ message: 'Envío creado exitosamente' });
        }

        // 📌 OBTENER TODOS LOS ENVÍOS
        if (pattern === 'findAllEnvios') {
          return of([
            { id_envio: 1, id_pedido: 1, estado: 'PENDIENTE', metodo_envio: 'terrestre' },
          ]);
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

        if (token === 'valid_token_gestor') {
          request.user = {
            id: 'user1',
            role: 'GESTOR_PEDIDOS',
          };
          return true;
        }
        return false;
      }
    }

    class MockRoleGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.user?.role === 'GESTOR_PEDIDOS';
      }
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EnviosController],
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

  // 📌 PRUEBAS DE CREACIÓN DE ENVÍO
  it('Debe crear un envío correctamente con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .post('/envios/crear')
      .set('Authorization', 'Bearer valid_token_gestor')
      .send({
        id_pedido: 1,
        fecha_envio: '2024-12-08T12:00:00Z',
        fecha_entrega: '2024-12-15T12:00:00Z',
        estado: 'PENDIENTE',
        metodo_envio: 'terrestre',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Envío creado exitosamente');
      });
  });

  it('Debe rechazar inyección SQL en la creación de envío', async () => {
    return request(app.getHttpServer())
      .post('/envios/crear')
      .set('Authorization', 'Bearer valid_token_gestor')
      .send({
        id_pedido: "' OR '1'='1",
        fecha_envio: '2024-12-08T12:00:00Z',
        fecha_entrega: '2024-12-15T12:00:00Z',
        estado: 'PENDIENTE',
        metodo_envio: 'terrestre',
      })
      .expect(500);
  });

  it('Debe rechazar ataque XSS en la creación de envío', async () => {
    return request(app.getHttpServer())
      .post('/envios/crear')
      .set('Authorization', 'Bearer valid_token_gestor')
      .send({
        id_pedido: '<script>alert("XSS")</script>',
        fecha_envio: '2024-12-08T12:00:00Z',
        fecha_entrega: '2024-12-15T12:00:00Z',
        estado: 'PENDIENTE',
        metodo_envio: 'terrestre',
      })
      .expect(500);
  });

  // 📌 PRUEBAS DE OBTENCIÓN DE ENVÍOS
  it('Debe obtener la lista de envíos con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .get('/envios')
      .set('Authorization', 'Bearer valid_token_gestor')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
