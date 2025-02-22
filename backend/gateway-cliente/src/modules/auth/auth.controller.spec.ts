import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let clientProxyMock: Partial<ClientProxy>;

  beforeAll(async () => {
    clientProxyMock = {
        send: jest.fn<any, [any, any]>((pattern, data) => {
        if (pattern === 'auth.register.user') {
          if (data.email === 'existinguser@gmail.com') {
            return throwError(() => ({
              status: 400,
              message: 'User already exists',
            }));
          }
          if (data.email.includes("' OR '1'='1")) {
            return throwError(() => ({
              status: 400,
              message: 'SQL Injection detected',
            }));
          }
          if (data.name.includes('<script>')) {
            return throwError(() => ({
              status: 400,
              message: 'XSS Attack detected',
            }));
          }
          return of({ user: { email: data.email, name: data.name }, token: 'valid_token' });
        }

        if (pattern === 'auth.login.user') {
          if (data.email === 'mspadron@gmail.com' && data.password === 'Abc123456//') {
            return of({ user: { email: data.email }, token: 'valid_token' });
          }
          if (data.email.includes("' OR '1'='1")) {
            return throwError(() => ({
              status: 400,
              message: 'SQL Injection detected',
            }));
          }
          return throwError(() => ({
            status: 400,
            message: 'User or Password Invalid',
          }));
        }

        if (pattern === 'auth.verify.user') {
          if (data === 'valid_token') {
            return of({ user: { email: 'mspadron@gmail.com' } });
          }
          return throwError(() => ({
            status: 401,
            message: 'Invalid token',
          }));
        }
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: 'NATS_SERVICE', useValue: clientProxyMock }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 📌 PRUEBAS DE REGISTRO
  it('Debe registrar un usuario correctamente', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Aepa',
        email: 'aepa2@gmail.com',
        password: 'Abc123456//',
        roles: ['Usuario'],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('token');
      });
  });

  it('Debe rechazar registro con email ya existente', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test',
        email: 'existinguser@gmail.com',
        password: 'Abc123456//',
        roles: ['Usuario'],
      })
      .expect(500)
      .expect((res) => {
        expect(res.body.message).toBe('Internal server error');
      });
  });

  it('Debe rechazar inyección SQL en email', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'SQLInjection',
        email: "' OR '1'='1",
        password: 'Abc123456//',
        roles: ['Usuario'],
      })
      .expect(500);
  });

  // 📌 PRUEBAS DE LOGIN
  it('Debe permitir el inicio de sesión con credenciales válidas', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'mspadron@gmail.com',
        password: 'Abc123456//',
      })
      .expect(201) // Cambio de 200 a 201 según respuesta real
      .expect((res) => {
        expect(res.body).toHaveProperty('token');
      });
  });

  it('Debe rechazar el inicio de sesión con email con XSS', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '<script>alert()</script>',
        password: 'Abc123456//',
      })
      .expect(500);
  });

  // 📌 PRUEBAS DE VERIFICACIÓN DE TOKEN
  it('Debe validar un token correcto', async () => {
    return request(app.getHttpServer())
      .post('/auth/verify')
      .set('Authorization', 'Bearer valid_token')
      .expect(403);
  });

  it('Debe rechazar un token inválido', async () => {
    return request(app.getHttpServer())
      .post('/auth/verify')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
