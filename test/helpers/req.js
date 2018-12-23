const api = '/api/1';

module.exports = {
  get: path => {
    return request.get(`${api}${path}`)
      .set('Accept', 'application/json');
  },
  post: path => {
    return request.post(`${api}${path}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
  },
  delete: path => {
    return request.delete(`${api}${path}`)
      .set('Accept', 'application/json');
  },
  put: path => {
    return request.put(`${api}${path}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
  }
};
