const crypto = require('node:crypto');
const {
  removeEmptyValue,
  buildQueryString,
  createRequest,
  CreateRequest,
  pubRequest,
  defaultLogger,
} = require('./helpers/utils.js');

class APIBase {
  constructor(options) {
    const { apiKey, apiSecret, baseURL, logger } = options;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseURL = baseURL;
    this.logger = logger || defaultLogger;
  }
  //V3
  publicRequest(method, path, params = {}) {
    params = removeEmptyValue(params);
    params = buildQueryString(params);
    if (params !== '') {
      path = `${path}?${params}`;
    }
    return createRequest({
      method,
      baseURL: this.baseURL,
      url: path,
      apiKey: this.apiKey
    });
  }

  signRequest(method, path, params = {}) {
    params = removeEmptyValue(params);
    const timestamp = Date.now();
    let queryString = buildQueryString({ ...params, timestamp });
    queryString = queryString.replace(/\(/g, '%28').replace(/\)/g, '%29');
    const hmac = crypto.createHmac('sha256', this.apiSecret).update(queryString);
    const signature = hmac.digest('hex');
    return createRequest({
      method,
      baseURL: this.baseURL,
      url: `${path}?${queryString}&signature=${signature}`,
      apiKey: this.apiKey
    });
  }

  //V2
  PublicRequest(method, path, params = {}) {
    params = removeEmptyValue(params);
    params = buildQueryString(params);
    if (params !== '') {
      path = `${path}?${params}`;
    }
    return pubRequest({
      method,
      baseURL: this.baseURL,
      url: path,
      apiKey: this.apiKey
    });
  }

  SignRequest(method, path, params = {}) {
    params = removeEmptyValue(params);
    const timestamp = Date.now();
    const apiKey = this.apiKey;
    let objectString = apiKey + timestamp;

    if (method === 'POST') {
      path = `${path}`;
      objectString += JSON.stringify(params);
    } else {
      const queryString = buildQueryString({ ...params });
      path = `${path}?${queryString}`;
      objectString += queryString;
    }
    const hmac = crypto.createHmac('sha256', this.apiSecret).update(objectString);
    const Signature = hmac.digest('hex');
    return CreateRequest({
      method,
      baseURL: this.baseURL,
      url: path,
      apiKey: this.apiKey,
      timestamp,
      Signature,
      params
    });

  }
}

module.exports = APIBase;
