const APIBase = require('./APIBase.js');
const modules = require('./modules');
const { flowRight } = require('./helpers/utils.js');

class Future extends flowRight(...Object.values(modules))(APIBase) {
  constructor(apiKey = '', apiSecret = '', options = {}) {
    options.baseURL = options.baseURL || 'https://contract.mexc.com';
    super({
      apiKey,
      apiSecret,
      ...options
    });
  }
}

module.exports = Future;
