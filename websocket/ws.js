'use strict';

const { setTimeout } = require('timers/promises');
const WebSocket = require('ws');

const WS_URL = 'wss://wbs.mexc.com/ws';

const PING_INTERVAL = 20_000;
const WAIT_ON_CONNECTION_ERROR = 5_000;

// https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
const NORMAL_CLOSE_CODE = 1000;

const createConnection = () =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(WS_URL);
    socket.once('error', reject);
    socket.once('open', () => {
      const isOpened = socket.readyState === WebSocket.OPEN;
      if (isOpened) return void resolve(socket);
      const message = `Connection server error, state: ${socket.readyState}`;
      reject(new Error(message));
    });
  });

class WebSocketApi {
  #pingInterval = null;
  #reconnect = true;
  #sendQueue = [];

  constructor() {
    this.listeners = {};
    this.socket = null;
    this.#reconnect = true;
    this.#pingInterval = null;
    this.#sendQueue = [];
  }

  #ping() {
    this.#pingInterval = setInterval(() => {
      this.socket.send('{"method":"PING"}');
    }, PING_INTERVAL);
  }

  #addListener(listener, param) {
    this.listeners[param] = listener;
    this.#send(param);
  }

  #send(param) {
    const data = JSON.stringify({
      'method': 'SUBSCRIPTION',
      'params': [param],
    });
    if (this.socket) this.socket.send(data);
  }

  async connect() {
    if (!this.#reconnect) return;
    try {
      this.socket = await createConnection();
      this.#ping();
      const params = Object.keys(this.listeners);
      for (const param of params) this.#send(param);
      this.socket.on('close', this.connect.bind(this));
      this.socket.on('message', (chunk) => {
        const data = JSON.parse(chunk.toString('utf8'));
        const channel = data.c;
        if (!channel) return;
        const listener = this.listeners[channel];
        if (listener) listener(data);
      });
    } catch (err) {
      await setTimeout(WAIT_ON_CONNECTION_ERROR);
      return await this.connect();
    }
  }

  deals(symbols = 'BTCUSDT', cb = null) {
    if (!cb) return;
    const param = `spot@public.deals.v3.api@${symbols}`;
    this.#addListener(cb, param);
  }

  kline(symbols, min, cb = null) {
    if (!cb) return;
    const param = `spot@public.kline.v4.api@${symbols}@Min${min}`;
    this.#addListener(cb, param);
  }

  increaseDepth(symbols, cb = null) {
    if (!cb) return;
    const param = `spot@public.increase.depth.v3.api@${symbols}`;
    this.#addListener(cb, param);
  }

  limitDepth(symbols, depth, cb = null) {
    if (!cb) return;
    const param = `spot@public.limit.depth.v3.api@${symbols}@${depth}`;
    this.#addListener(cb, param);
  }

  miniTicker(symbols = 'BTCUSDT', tz = 'UTC+3', cb = null) {
    if (!cb) return;
    const param = `spot@public.miniTicker.v3.api@${symbols}@${tz}`;
    this.#addListener(cb, param);
  }

  priceTicker(symbols = 'BTCUSDT', tz = 'UTC+3', cb = null) {
    if (!cb) return;
    this.miniTicker(symbols, tz, (data) => {
      cb({ price: data.d.p, symbol: data.s });
    });
  }

  bookTicker(symbols = 'BTCUSDT', cb = null) {
    if (!cb) return;
    const param = `spot@public.bookTicker.v3.api@${symbols}`;
    this.#addListener(cb, param);
  }

  close(cb = null) {
    this.#reconnect = false;
    if (cb) this.socket.on('close', cb);
    if (this.#pingInterval) {
      clearInterval(this.#pingInterval);
      this.#pingInterval = null;
    }
    this.socket.close(NORMAL_CLOSE_CODE);
  }
}

module.exports = WebSocketApi;

// ws.onopen = () => {
//   console.log('Connection open');
//   ws.send('{"method":"PING"}');
//   Deals();
// };
//
// ws.onmessage = (e) => {
//   console.log(e.data);
// };
//
// ws.onclose = () => {
//   console.log('close');
// };

/**
 * deals
 * @param ws
 */
function Deals() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@public.deals.v3.api@BTCUSDT']
  };
  ws.send(JSON.stringify(data));
}

/**
 * kline
 * @param ws
 */
function Kline() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@public.kline.v4.api@BTCUSDT@Min15']
  };
  ws.send(JSON.stringify(data));
}

/**
 * increasedepth
 * @param ws
 */
function IncreaseDepth() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@public.increase.depth.v3.api@BTCUSDT']
  };
  ws.send(JSON.stringify(data));
}

/**
 * limitdepth
 * @param ws
 */
function LimitDepth() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@public.limit.depth.v3.api@BTCUSDT@5']
  };
  ws.send(JSON.stringify(data));
}

/**
 * bookTicker
 * @param ws
 */
function BookTicker() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@public.bookTicker.v3.api@BTCUSDT']
  };
  ws.send(JSON.stringify(data));
}

/**
 * account
 * WS_URL = 'wss://wbs.mexc.com/ws?listenKey=Your listenkey'
 * @param ws
 */
function Account() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@private.account.v3.api']
  };
  ws.send(JSON.stringify(data));
}

/**
 * accountdeals
 * WS_URL = 'wss://wbs.mexc.com/ws?listenKey=Your listenkey'
 * @param ws
 */
function AccountDeals() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@private.deals.v3.api']
  };
  ws.send(JSON.stringify(data));
}

/**
 * orders
 * WS_URL = 'wss://wbs.mexc.com/ws?listenKey=Your listenkey'
 * @param ws
 */
function Orders() {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': ['spot@private.orders.v3.api']
  };
  ws.send(JSON.stringify(data));
}
