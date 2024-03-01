const APIBase = require('./apibase.js');
const modules = require('./modules');
const { flowRight } = require('./helpers/utils.js');

class Spot extends flowRight(...Object.values(modules))(APIBase) {
  constructor(apiKey = '', apiSecret = '', options = {}) {
    options.baseURL = options.baseURL || 'https://api.mexc.com';
    super({
      apiKey,
      apiSecret,
      ...options
    });
  }
}
module.exports = Spot;
