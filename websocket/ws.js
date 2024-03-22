'use strict';

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

const send = (socket, param) => {
  const data = {
    'method': 'SUBSCRIPTION',
    'params': [param],
  };
  socket.send(JSON.stringify(data));
};

const webSocketApi = async () => {
  let socket = await createConnection();
  let reconnecting = true;

  const listeners = {};

  const connectionInit = async () => {
    if (!reconnecting) return;
    try {
      socket = await createConnection();
      const params = Object.keys(listeners);
      for (const param of params) send(socket, param);
      socket.on('close', connectionInit);
      socket.on('message', (chunk) => {
        const data = JSON.parse(chunk.toString('utf8'));
        const channel = data.c;
        if (channel) {
          const listener = listeners[channel];
          if (listener) listener(data);
        }
      });
    } catch {
      setTimeout(connectionInit, WAIT_ON_CONNECTION_ERROR);
    }
  };

  let pingInterval = setInterval(() => {
    socket.send('{"method":"PING"}');
  }, PING_INTERVAL);

  setTimeout(() => {
    if (listeners.length === 0 && params.length === 0) {
      clearInterval(pingInterval);
      socket.close(NORMAL_CLOSE_CODE);
    }
  }, 0);

  const addListener = (listener, param) => {
    listeners[param] = listener;
    send(socket, param);
  };

  connectionInit();

  return {
    deals(symbols = 'BTCUSDT', cb = null) {
      if (!cb) return;
      const param = `spot@public.deals.v3.api@${symbols}`;
      addListener(cb, param);
    },
    kline(symbols, min, cb = null) {
      if (!cb) return;
      const param = `spot@public.kline.v4.api@${symbols}@Min${min}`;
      addListener(cb, param);
    },
    increaseDepth(symbols, cb = null) {
      if (!cb) return;
      const param = `spot@public.increase.depth.v3.api@${symbols}`;
      addListener(cb, param);
    },
    limitDepth(symbols, depth, cb = null) {
      if (!cb) return;
      const param = `spot@public.limit.depth.v3.api@${symbols}@${depth}`;
      addListener(cb, param);
    },
    miniTicker(symbols = 'BTCUSDT', tz = 'UTC+3', cb = null) {
      if (!cb) return;
      const param = `spot@public.miniTicker.v3.api@${symbols}@${tz}`;
      addListener(cb, param);
    },
    priceTicker(symbols = 'BTCUSDT', cb = null) {
      if (!cb) return;
      this.miniTicker(symbols, 'UTC+3', (data) => {
        cb({ price: data.d.p, symbol: data.s });
      });
    },
    bookTicker(symbols = 'BTCUSDT', cb = null) {
      if (!cb) return;
      const param = `spot@public.bookTicker.v3.api@${symbols}`;
      addListener(cb, param);
    },
    close(cb = null) {
      reconnecting = false;
      if (cb) socket.on('close', cb);
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      socket.close(NORMAL_CLOSE_CODE);
    }
  };
};

module.exports = webSocketApi;

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
