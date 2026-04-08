import { request } from './api.js'

function fetchTradeOverview() {
  return request('/trades/stats/overview')
}

function fetchTrades(query = {}) {
  return request('/trades', { query })
}

function fetchTrade(tradeId) {
  return request(`/trades/${tradeId}`)
}

function createTrade(payload) {
  return request('/trades', {
    method: 'POST',
    body: payload,
  })
}

function updateTrade(tradeId, payload) {
  return request(`/trades/${tradeId}`, {
    method: 'PATCH',
    body: payload,
  })
}

function deleteTrade(tradeId) {
  return request(`/trades/${tradeId}`, {
    method: 'DELETE',
  })
}

export {
  createTrade,
  deleteTrade,
  fetchTrade,
  fetchTradeOverview,
  fetchTrades,
  updateTrade,
}
