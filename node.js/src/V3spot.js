const APIBase = require('./APIBase')
const modules = require('./modules/index')
const { flowRight } = require('./helpers/utils')

class V3spot extends flowRight(...Object.values(modules))(APIBase) {
  constructor (apiKey = '', apiSecret = '', options = {}) {
    options.baseURL = options.baseURL || 'https://api.mexc.com'
    super({
      apiKey,
      apiSecret,
      ...options
    })
  }
}

module.exports = V3spot