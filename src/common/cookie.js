/**
 * Created by zhan on 2017/3/14.
 */
let Cookies = require('js-cookie')

const COOKIE_COMMON_UES_API_LIST = 'commonUseApiList'     // cookie：常使用的api列表
const COOKIE_LOGIN_INFO = 'loginInfo'                     // cookie: 登陆凭据
const COOKIE_USE_SERVER = 'useServer'                     // cookie: 服务器地址
const COOKIE_COMMON_USE_SERVER_URL = 'commonUseServerUrl' // cookie: 常用服务器地址

export function saveUseServer (useServer) {
  Cookies.set(COOKIE_USE_SERVER, useServer)
}

export function getUseServer () {
  return Cookies.get(COOKIE_USE_SERVER)
}

export function getCommonUseApiList () {
  return Cookies.getJSON(COOKIE_COMMON_UES_API_LIST)
}

export function saveCommonUseApiList (val) {
  Cookies.set(COOKIE_COMMON_UES_API_LIST, val)
}

export function getLoginInfo () {
  return Cookies.getJSON(COOKIE_LOGIN_INFO)
}

export function saveLoginInfo (loginInfo) {
  Cookies.set(COOKIE_LOGIN_INFO, loginInfo)
}

export function getCommonUseServerUrl () {
  return Cookies.getJSON(COOKIE_COMMON_USE_SERVER_URL)
}

export function saveCommonUseServerUrl (val) {
  Cookies.set(COOKIE_COMMON_USE_SERVER_URL, val)
}
