import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Dashboard API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/dashboard/stats (GET)', () => {
    it('should return dashboard statistics', () => {
      return request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('leads');
          expect(res.body).toHaveProperty('invoices');
          expect(res.body).toHaveProperty('bookings');
          expect(res.body).toHaveProperty('messages');
          expect(res.body.leads).toHaveProperty('total');
          expect(res.body.leads).toHaveProperty('conversionRate');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/dashboard/stats').expect(401);
    });
  });

  describe('/dashboard/revenue-chart (GET)', () => {
    it('should return revenue chart data for month', () => {
      return request(app.getHttpServer())
        .get('/dashboard/revenue-chart?period=month')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return revenue chart data for week', () => {
      return request(app.getHttpServer())
        .get('/dashboard/revenue-chart?period=week')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return revenue chart data for year', () => {
      return request(app.getHttpServer())
        .get('/dashboard/revenue-chart?period=year')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
