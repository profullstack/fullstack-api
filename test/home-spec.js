const req = require('./helpers/req');

describe('Home', () => {
  context('/api/1', () => {
    it('should get 200', async () => {
      const res = await req.get('')
        .expect(200);
    });

    it('should version numbers', async () => {
      const api = require('../package.json').version;
      const res = await req.get('')
        .expect(200);

      expect(res.body['fullstack-api']).to.equal(api);
    });
  });
});
