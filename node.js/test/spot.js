const Spot = require('../src/spot')
const apiKey = ''
const apiSecret = ''
const client = new Spot(apiKey, apiSecret, { baseURL: 'https://api.mexc.com' })

//AccountInformation
client.AccountInformation().then(response => client.logger.log(response.data))
  .catch(error => client.logger.error(error))

//Place an order
client.placeOrder({ "order_type": "LIMIT_ORDER", "price": "XX", "quantity": "XX", "symbol": "MX_USDT", "trade_type": "BID" })
  .then(response => client.logger.log(response.data)) 

//BatchOrders
client.BatchOrders({ batchOrders: [{ "type": "LIMIT", "price": "XX", "quantity": "XX", "symbol": "MXUSDT", "side": "BUY" }, { "type": "LIMIT", "price": "XX", "quantity": "XX", "symbol": "MXUSDT", "side": "BUY" }] })
    .then(response => client.logger.log(response.data))