/**
 * Created by zhan on 2016/11/18.
 */
// 设置cookie
let setCookie = (key, value, ttl) => {
  let exdate = new Date()
  exdate.setDate(exdate.getDate() + ttl)
  document.cookie = key + '=' + escape(value) + ((ttl == null) ? '' : ';expires=' + exdate.toGMTString())
}

let getCookie = (key) => {
  if (document.cookie.length > 0) {
    let strStart = document.cookie.indexOf(key + '=')
    if (strStart !== -1) {
      strStart = strStart + key.length + 1
      let strEnd = document.cookie.indexOf(';', strStart)
      if (strEnd === -1) strEnd = document.cookie.length
      return unescape(document.cookie.substring(strStart, strEnd))
    }
  }
  return ''
}
export default {
  setCookie,
  getCookie
}
