const fetch = require('node-fetch');
const config = require('../config');

/**
 * Send the prepared transaction payload to the Pi relay endpoint.
 * The endpoint, headers, and API key are configured in the backend config.
 */
async function broadcastPiTransaction(payload) {
  const endpoint = config.pi.transactionEndpoint;
  const apiKey = config.pi.transactionApiKey;

  if (!endpoint) {
    throw new Error('Pi transaction endpoint is not configured.');
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: createAbortSignal(config.pi.transactionTimeoutMs)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || `Pi relay responded with status ${response.status}`;
    const err = new Error(errorMessage);
    err.response = data;
    err.status = response.status;
    throw err;
  }

  return {
    success: true,
    data,
    status: 'confirmed'
  };
}

function createAbortSignal(timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) {
    return undefined;
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

module.exports = {
  broadcastPiTransaction
};
