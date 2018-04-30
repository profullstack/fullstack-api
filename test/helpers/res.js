const api = '/api/1';
const Meta = {
  checkMetaSearch: res => {
    const meta = res.body.meta;
    Meta.checkMeta(res);

    expect(meta.request).to.have.property('query')
      .that.is.a('string');
  },

  checkMeta: res => {
    const meta = res.body.meta;

    expect(meta).to.be.an('object')
      .that.has.property('request');

    expect(meta.total).to.be.a('number');
  },

  checkMetaParse: res => {
    const meta = res.body.meta;
    Meta.checkMeta(res);

    expect(meta.request).to.have.property('queries')
      .that.is.an('array');
  }
};

module.exports = Meta;
