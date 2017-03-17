/**
 * Created by zhan on 2017/3/17.
 */
let request = require('request')

export function post (url, data, callback) {
  let options = {
    url: url,
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST',
    json: true,
    body: data
  }
  return request(options, callback)
}
