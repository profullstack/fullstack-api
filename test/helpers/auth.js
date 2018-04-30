module.exports = {
  login: creds => {
    return request.post('/api/1/accounts/login')
      .set('Accept', 'application/json')
      .send(creds);
  }
};
