const request = require('supertest');
const { app, server } = require('../server');

afterAll((done) => {
  if (server && server.listening) {
    return server.close(done);
  }
  done();
});

describe('SafeVote Backend Integration Tests', () => {
  test('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /login with valid user returns success', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'voter1', password: 'pass1' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
  });

  test('POST /votes submits a vote successfully', async () => {
    const res = await request(app)
      .post('/votes')
      .send({ userId: 1, candidateId: 101 });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Vote submitted successfully');
  });

  test('GET /results returns encrypted results', async () => {
    const res = await request(app).get('/results');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('encryptedResults');
  });
});