const chai = require('chai');
const app = require('../../index.js');
const chaiString = require('chai-string');

chai.use(chaiString);
global.supertest = require('supertest-as-promised');
global.request = supertest.agent(app.listen());
global.expect = chai.expect;
global._ = require('lodash');
