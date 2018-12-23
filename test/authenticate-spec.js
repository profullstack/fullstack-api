const auth = require('./helpers/auth');

describe('Authentication', () => {
  context('/accounts/login', () => {
    it('should get 401 on wrong password', async () => {
      const res = await auth.login({ username: 'test1', password: 'wrongpass' })
        .expect(401);

      expect(res.body.message).to.equal('Authentication failed');
    });

    it('should get 201 on correct password', async () => {
      const res = await auth.login({ username: 'test1', password: 'asdf123' })
        .expect(201);

      expect(res.body.message).to.equal('Successfully logged in!');
      expect(res.body.user).to.be.an('object');
      expect(res.body.user).to.have.property('_id')
        .that.is.a('string');
      expect(res.body.user).to.have.property('username')
        .that.is.a('string');
      expect(res.body.user).to.have.property('createdAt')
        .that.is.a('string');
      expect(res.body.user).to.have.property('updatedAt')
        .that.is.a('string');
      expect(res.body.user.password).to.not.exist;
      expect(res.body.user.hashedPassword).to.not.exist;
    });
  });

  context('auth middleware', () => {
    const Auth = require('../src/middleware/authenticate');
    const _auth = new Auth();
    const plaintext = 'asdf123';

    it('get hash from password', async () => {
      const hash = await _auth.hashPassword(plaintext);

      expect(hash).to.exist;
      expect(hash).to.be.length(60);
    });

    it('correct password works with token', async () => {
      const hash = await _auth.hashPassword(plaintext);
      const isOk = await _auth.compare(plaintext, hash);

      expect(isOk).to.be.true;
    });

    it('wrong password does not work with token', async () => {
      const hash = await _auth.hashPassword(plaintext);
      const isOk = await _auth.compare('wrongpassword', hash);

      expect(isOk).to.be.false;
    });

    it('auth.jwt exists', async () => {
      const jwt = _auth.jwt();

      expect(jwt).to.exist;
    });

    context('protected route', () => {
      class Controller {
        constructor() {}
        async get(ctx, next) {
          ctx.body = await Promise.resolve('some data');
        }
      }
      const controller = new Controller();
      const Koa = require('koa');
      const app = new Koa();
      const Router = require('koa-router');
      const router = new Router({ prefix: '/protected' });

      router.get('/', _auth.jwt(), controller.get.bind(controller));
      app.use(router.routes());
      app.use(router.allowedMethods());

      it('auth.jwt protects route without token in header', async () => {
        const res = await supertest.agent(app.listen()).get('/protected')
          .expect(401);

        expect(res.text).to.equal('No authentication token found\n');
      });


      it('auth.jwt protects route with invalid token in header', async () => {
        const authRes = await auth.login({ username: 'test1', password: 'asdf123' });
        const res = await supertest.agent(app.listen()).get('/protected')
          .set('Accept', 'application/json')
          .set('Authorization', `bearer ${`${authRes.body.token}badtoken`}`)
          .expect(401);

        expect(res.text).to.equal('Invalid token\n');
      });

      it('auth.jwt allows protected route with valid token in header', async () => {
        const authRes = await auth.login({ username: 'test1', password: 'asdf123' });
        const res = await supertest.agent(app.listen()).get('/protected')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${authRes.body.token}`)
          .expect(200);

        expect(res.text).to.equal('some data');
      });
    });
  });
});
