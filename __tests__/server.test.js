const request = require('supertest');
const { app } = require('../server');
const crypto = require('crypto-js');

describe('SafeVote API', () => {
  test('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /login with valid credentials returns success', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'voter1', password: 'pass1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
  });
});
