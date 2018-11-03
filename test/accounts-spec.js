const req = require('./helpers/req');

describe.only('Accounts', () => {
  context('/accounts', () => {
    let user1;
    let user2;

    before(async () => {
      let res;
      try {
        res = await req.post('/accounts')
          .send({
            username: 'deleteme1',
            password: 'password1'
          })
          .expect(201);
      } catch (err) {
        console.error(err);
      }

      user1 = res.body;
    });

    after(async () => {
      return req.delete(`/accounts/${user1._id}`)
        .send({ username: user1.username, password: 'password1' })
        .expect(204);
    });

    it.only('create new user', async () => {
      const res = await req.post('/accounts')
        .send({
          username: 'newuser2',
          password: 'password2'
        })
        .expect(200);

      user2 = res.body;

      expect(user2).to.have.property('username')
        .that.is.a('string');
      expect(user2).to.have.property('_id')
        .that.is.a('string');
      expect(user2).to.have.property('updatedAt')
        .that.is.a('string');
      expect(user2).to.have.property('createdAt')
        .that.is.a('string');
      expect(user2.password).to.not.exist;
      expect(user2.hashedPassword).to.not.exist;
    });

    it('delete existing user without password fails', async () => {
      const res = await req.delete(`/accounts/${user2._id}`)
        .send({ username: user2.username })
        .expect(401);

      expect(res.body).to.have.property('message')
        .that.is.a('string');
      expect(res.body.message).to.equal('Authentication failed');
    });

    it('delete existing user', async () => {
      const res = await req.delete(`/accounts/${user2._id}`)
        .send({ username: user2.username, password: 'password2' })
        .expect(204);

      expect(res.body).to.be.empty;
    });

    it('create duplicate user fails', async () => {
      const res = await req.post('/accounts')
        .send({
          username: 'deleteme1',
          password: 'passwordnew1'
        })
        .expect(401);

      expect(res.body.message).to.equal('User already exists');
    });

    it('delete user without password fails (unauthenticated)', async () => {
      const res = await req.delete(`/accounts/${user1._id}`)
        .expect(401);

      expect(res.body.message).to.equal('Authentication failed');
    });
  });
});
