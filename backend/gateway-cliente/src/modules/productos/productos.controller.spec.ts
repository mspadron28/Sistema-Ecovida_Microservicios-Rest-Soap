import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { ProductosController } from './productos.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { AuthGuard, RoleGuard } from '../auth/guards';

describe('ProductosController (e2e)', () => {
  let app: INestApplication;
  let clientProxyMock: Partial<ClientProxy>;

  beforeAll(async () => {
    clientProxyMock = {
      send: jest.fn<any, [any, any]>((pattern, data) => {
        // 📌 CREAR PRODUCTO
        if (pattern === 'createProducto') {
          if (data.nombre.includes("' OR '1'='1")) {
            return throwError(() => ({
              status: 400,
              message: 'Internal server error',
            }));
          }
          if (data.nombre.includes('<script>')) {
            return throwError(() => ({
              status: 400,
              message: 'XSS Attack detected',
            }));
          }
          return of({ message: 'Producto creado exitosamente' });
        }

        // 📌 OBTENER STOCK MÍNIMO
        if (pattern === 'findLowStockProducts') {
          if (typeof data !== 'number' || data < 0) {
            return throwError(() => ({
              status: 400,
              message: 'Invalid stock value',
            }));
          }
          return of([{ id_producto: 1, nombre: 'Producto Test', stock: 10 }]);
        }

        // 📌 OBTENER STOCK DE UN PRODUCTO
        if (pattern === 'findStockByProductId') {
          if (data === 1) {
            return of({ idProducto: 1, stock: 50 });
          }
          return throwError(() => ({
            status: 404,
            message: 'Producto no encontrado',
          }));
        }

        // 📌 OBTENER TODOS LOS PRODUCTOS
        if (pattern === 'findAllProductos') {
          return of([
            { id_producto: 1, nombre: 'Producto A', stock: 50 },
            { id_producto: 2, nombre: 'Producto B', stock: 30 },
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

        if (token === 'valid_token_gestor' || token === 'valid_token_usuario') {
          request.user = {
            id: 1,
            email: 'test@example.com',
            role: token === 'valid_token_gestor' ? 'GESTOR_PRODUCTOS' : 'USUARIO',
          };
          return true;
        }
        return false;
      }
    }

    class MockRoleGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.user?.role === 'GESTOR_PRODUCTOS' || request.user?.role === 'USUARIO';
      }
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
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

  // 📌 PRUEBAS DE CREACIÓN DE PRODUCTO
  it('Debe crear un producto correctamente con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .post('/productos')
      .set('Authorization', 'Bearer valid_token_gestor') // Simula token válido de GESTOR_PRODUCTOS
      .send({
        nombre: 'Bio pera cbd',
        precio: 15.6,
        stock: 77,
        id_categoria: 3,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Producto creado exitosamente');
      });
  });

  it('Debe rechazar inyección SQL en el nombre del producto', async () => {
    return request(app.getHttpServer())
      .post('/productos')
      .set('Authorization', 'Bearer valid_token_gestor')
      .send({
        nombre: "' OR '1'='1",
        precio: 15.6,
        stock: 77,
        id_categoria: 3,
      })
      .expect(500)
      .expect((res) => {
        expect(res.body.message).toBe('Internal server error');
      });
  });

  it('Debe rechazar ataque XSS en el nombre del producto', async () => {
    return request(app.getHttpServer())
      .post('/productos')
      .set('Authorization', 'Bearer valid_token_gestor')
      .send({
        nombre: '<script>alert("XSS")</script>',
        precio: 15.6,
        stock: 77,
        id_categoria: 3,
      })
      .expect(500)
      .expect((res) => {
        expect(res.body.message).toBe('Internal server error');
      });
  });

  // 📌 PRUEBAS DE OBTENCIÓN DE STOCK MÍNIMO
  it('Debe obtener productos con stock menor a un valor específico', async () => {
    return request(app.getHttpServer())
      .post('/productos/stock-minimo')
      .set('Authorization', 'Bearer valid_token_gestor')
      .send({
        minStock: 21,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  // 📌 PRUEBAS DE STOCK DE PRODUCTO
  it('Debe obtener el stock de un producto existente', async () => {
    return request(app.getHttpServer())
      .get('/productos/stock/1')
      .set('Authorization', 'Bearer valid_token_usuario')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('stock');
      });
  });

  it('Debe rechazar consulta de stock de un producto inexistente', async () => {
    return request(app.getHttpServer())
      .get('/productos/stock/999')
      .set('Authorization', 'Bearer valid_token_usuario')
      .expect(500)
      .expect((res) => {
        expect(res.body.message).toBe('Internal server error');
      });
  });

  // 📌 PRUEBAS DE OBTENCIÓN DE TODOS LOS PRODUCTOS
  it('Debe obtener la lista de productos con el rol adecuado', async () => {
    return request(app.getHttpServer())
      .get('/productos')
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
