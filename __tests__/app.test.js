const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

jest.mock('../lib/utils/github');

const agent = request.agent(app);

describe('oauth full build routes', () => {
  beforeAll(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('should redirect to the github oauth page upon get to /login', async () => {
    const req = await request(app).get('/api/v1/github/login');

    expect(req.header.location).toMatch(
      /https:\/\/github.com\/login\/oauth\/authorize\?client_id=[\w\d]+&redirect_uri=http:\/\/localhost:7890\/api\/v1\/github\/login\/callback&scope=user/i
    );
  });

  it('should login and redirect users to /api/v1/posts', async () => {
    const res = await agent
      .get('/api/v1/github/login/callback?code=42')
      .redirects(1);

    const expected = [expect.stringMatching('/api/v1/posts')];
    expect(res.redirects).toEqual(expect.arrayContaining(expected));
  });

  it('should allow authenticated users to view /api/v1/posts', async () => {
    const res = await agent
      .get('/api/v1/github/login/callback?code=42')
      .redirects(1);

    expect(res.body).toEqual([]);
  });

  it('should allow authenticated users to post /api/v1/posts and record the correct username', async () => {
    const res = await agent
      .post('/api/v1/posts')
      .send({ post: 'what is life?', username: 'wrong username' });

    expect(res.body).toEqual({
      id: expect.any(String),
      post: 'what is life?',
      username: 'fake_github_user',
    });
  });

  it('should sign out a user with a delete method to /api/vi/github', async () => {
    const res = await agent.delete('/api/v1/github');

    expect(res.body).toEqual({
      message: 'Signed out successfully!',
      success: true,
    });
  });

  it('should not allow unauthenticated users to view /api/v1/posts', async () => {
    //test not using agent initialized above in order to imitate unauth'd user
    const res = await request.agent(app).get('/api/v1/posts');

    expect(res.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
  });
});
