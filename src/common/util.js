/**
 * Created by zhan on 2016/11/18.
 */
let getTimestamp = () => {
  let time = (new Date()).getTime()/1000
  time = '' + time
  return time.slice(0, time.indexOf('.'))
}
export default {
  getTimestamp
}
