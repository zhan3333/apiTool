<template>
  <div>
    <!--头部-->
    <el-row class="head">
      <el-col :span="24" class="navigate">
        <el-menu default-active="1" mode="horizontal" theme="dark">
          <template v-for="(className, key) in classNameArr">
            <el-submenu :index="className">
              <template slot="title">{{className}}</template>
              <template v-for="(apiName, key2) in getApiArrByClassName(className)">
                <el-menu-item :index="apiName">
                  <div size="mini" @click="clickApi(className, apiName)">{{apiName}}</div>
                </el-menu-item>
              </template>
            </el-submenu>
          </template>
        </el-menu>
      </el-col>
    </el-row>
    <!--中间-->
    <el-row :gutter="10">
      <!--api操作-->
      <el-col :span="16" class="main">
        <el-row class="row-api-info">
          <el-card>
            <el-tag>api:</el-tag>
            <el-tag v-show="!api">请选择api</el-tag>
            <el-tag v-text="api"  v-show="api"></el-tag>
            <el-tooltip effect="dark" content="加入常用接口" placement="right">
              <el-tag v-show="api" type="success">
                <el-button size="mini" type="text" @click="recordCommonUseApi" icon="plus"></el-button>
              </el-tag>
            </el-tooltip>
          </el-card>
        </el-row>
        <!--输入-->
        <el-row class="row-api-input" v-show="api">
          <el-card>
            <div slot="header" class="clearfix">
              <el-tag>输入参数</el-tag>
            </div>
            <el-form label-position="top" onkeydown="if(event.keyCode==13){return false;}">
              <template v-for="(param, index) in params">
                <el-form-item :label="index + ': ' + param">
                  <el-input v-model="form[index]"></el-input>
                </el-form-item>
              </template>
              <el-form-item>
                <el-row type="flex" justify="end">
                  <el-col :span="24">
                    <el-button type="primary" @click="onSubmit" native-type="button">提交</el-button>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </el-card>
        </el-row>
        <!--输出-->
        <el-row  class="row-api-output" v-show="api">
          <el-card>
            <div slot="header" class="clearfix">
              <el-tag v-text="">返回结果:</el-tag>
              <el-tag>服务器耗时:{{apiDoTime}}ms</el-tag>
              <el-tag>总耗时:{{allDoTime}}ms</el-tag>
            </div>
            <el-tree :data="treeResult" :props="defaultProps"></el-tree>
          </el-card>
        </el-row>
      </el-col>
      <!--侧边栏-->
      <el-col :span="8">
        <!--常用接口块-->
        <el-row>
          <el-card>
              <el-tooltip content="服务器地址" placement="left">
                <el-tag v-text="server" hit type="success"></el-tag>
              </el-tooltip>
              <el-tooltip content="修改api服务器地址" placement="bottom">
                <el-button size="small" type="primary" @click.native="inputServer">修改</el-button>
              </el-tooltip>
          </el-card>
        </el-row>
        <!--常用api-->
        <el-row>
          <el-card>
            <div slot="header">
              <span>常用接口</span>
            </div>
            <template v-for="(item, key) in getCommonUseList" style="display:table;">
              <div>
                <el-button-group>
                  <el-button type="small" @click="recordCommonUseApi(item.className, item.apiName)">{{item.use}}</el-button>
                  <el-button  icon="close" type="small"
                              @click="removeCommonUseApi(item.className, item.apiName)"></el-button>
                  <el-button  type="small"
                             @click="clickApi(item.className, item.apiName)">{{item.className + '_' + item.apiName}}</el-button>
                </el-button-group>
              </div>
            </template>
          </el-card>
        </el-row>
        <!--常用服务器url-->
        <el-row>
          <el-card>
            <div slot="header">
              <span>常用服务器</span>
            </div>
            <template v-for="(item, key) in getCommonServerUrl" style="display:table;">
              <div>
                <el-button-group>
                  <el-button type="small" @click="recordCommonServerUrl(item.url)">{{item.use}}</el-button>
                  <el-button  icon="close" type="small"
                              @click="removeCommonServerUrl(item.url)"></el-button>
                  <el-button  type="small"
                              @click="changeServer(item.url)" v-text="item.url"></el-button>
                  <el-button  icon="edit" type="small"
                              @click="openRemarkBox(item.url)"></el-button>
                </el-button-group>
              </div>
            </template>
          </el-card>
        </el-row>
      </el-col>
    </el-row>
    <!--尾部-->
    <el-row type="flex" justify="end">
    </el-row>
  </div>
</template>
<script type="text/ecmascript-6">
import hprose from '../static/hprose/hprose-html5'
// import {client} from '../common/hprose/hprose-vue'
import {toString} from '../common/filter/util'
// import * as util from '../common/util'
let _ = require('lodash')
// let $ = require('jQuery')
let Cookies = require('js-cookie')
const COOKIE_COMMON_UES_API_LIST = 'commonUseApiList'     // cookie：常使用的api列表
const COOKIE_LOGIN_INFO = 'loginInfo'                     // cookie: 登陆凭据
const COOKIE_USE_SERVER = 'useServer'                     // cookie: 服务器地址
const COOKIE_COMMON_USE_SERVER_URL = 'commonUseServerUrl' // cookie: 常用服务器地址
export default {
  name: 'zhan',
  data () {
    return {
      // hprose对象
      client: {},
      defaultServer: 'http://z.zhannnnn.top',
      useServer: '',    // 正在使用的服务器地址
      classNameArr: [],
      apiNameArr: [],
      selectApi: [],     // 选中的api，用于界面显示
      // 执行api实际使用时间 毫秒
      allDoTime: null,
      // 表单数据
      form: {},
      // api返回数据
      result: {},
      // 登陆凭证 {once: {token: '', userId: ''}
      loginInfo: {},
      // 树形图使用数据
      treeResult: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 常用api列表
      commonUseApiList: {},    // {"server": {"Tool_ip": {className: "Tool", apiName: "ip", use: 1}, ...}}
      commonUseServerUrl: {}    // 常用服务器地址 {'server': {'url': 'http://**.com', 'use': 1, 'remark': '可以编辑的记录'}}
    }
  },
  mounted () {
    // 取出cookie
    let loginInfo = Cookies.getJSON(COOKIE_LOGIN_INFO)
    let useServer = Cookies.get(COOKIE_USE_SERVER)
    let commonUseApiList = Cookies.getJSON(COOKIE_COMMON_UES_API_LIST)
    let commonUseServerUrl = Cookies.getJSON(COOKIE_COMMON_USE_SERVER_URL)
    if (useServer) this.useServer = useServer
    if (loginInfo) this.loginInfo = loginInfo
    if (commonUseApiList) this.commonUseApiList = commonUseApiList
    if (commonUseServerUrl) this.commonUseServerUrl = commonUseServerUrl
    this.initData()
  },
  methods: {
    // 根据类名，获取该类下的api列表
    getApiArrByClassName (className) {
      return _.keys(_.get(this.apiNameArr, className))
    },
    // 点击api名称，切换api
    clickApi (className, apiName) {
      console.log('click : ', className + '_' + apiName)
      this.cleanData()
      this.selectApi = {'className': className, 'apiName': apiName}
    },
    // 提交表单
    onSubmit () {
      console.log('submit!')
      console.log('form: ', this.form)
      if (!this.api) {
        console.error('未选择接口')
        return ''
      }
      let startTime = (new Date()).getTime()
      let promise = this.client.invoke(this.api, this.handleArgs())
      promise.then((result) => {
        console.info('接口' + this.api + '返回数据 :', result)
        this.result = result
        this.treeResult = this.handleResultToTree(result)
        this.recordCommonUseApi()   // 调用记录
        // 计算接口调用使用时间 =>毫秒
        let endTime = (new Date()).getTime()
        this.allDoTime = endTime - startTime
        // 记录登陆凭证
        if (_.has(result, 'once')) {
          this.loginInfo = result.once
          Cookies.set(COOKIE_LOGIN_INFO, this.loginInfo)
        }
      }).catch((error) => {
        console.error('接口' + this.api + '返回错误: ', error)
      })
      return false
    },
    // 处理传入接口的参数
    handleArgs () {
      let args = {}
      for (let key of _.keys(this.form)) {
        if (this.form[key]) {
          _.set(args, key, JSON.parse(this.form[key]))
        }
      }
      if (this.loginInfo['userId'] && this.loginInfo['token']) {
        return [{data: args, userId: this.loginInfo['userId'], token: this.loginInfo['token']}]
      }
      return [{data: args}]
    },
    cleanData () {
      this.selectApi = []
      this.result = {}
      this.treeResult = []
      this.form = {}
      this.allDoTime = null
    },
    initData (server) {
      let useServer = ''
      if (server) {
        useServer = server
      } else {
        useServer = this.server
      }

      let client = hprose.Client.create(useServer)
      let promise = client.invoke('Test_getApiList')
      promise.then((data) => {
        console.log('get apiList: ', data)
        data = _.omit(data, ['ret', 'debug'])
        this.$message({type: 'success', showClose: true, message: '连接服务器成功：' + useServer})
        // 开始设置数据
        this.client = client
        this.useServer = useServer
        this.apiNameArr = data
        this.classNameArr = _.keys(data)
        this.recordCommonServerUrl(useServer) // 记录使用过的服务器链接
        Cookies.set('useServer', useServer)  // 设置cookie
      }).catch((err) => {
        console.error(err)
        this.$message({type: 'error', showClose: true, message: '操作未生效, 服务器地址异常，无法加载api信息, 地址为：' + this.server})
      })
    },
    checkServerUrl (url) {
      let client = hprose.Client.create(url)
      let promise = client.invoke('Test_getApiList')
      return promise
    },
    inputServer () {
      this.$prompt('请输入服务器地址', '提示', {
//        inputPattern: "^((https|http|ftp|rtsp|mms)://)?[a-z0-9A-Z]{3}\.[a-z0-9A-Z][a-z0-9A-Z]{0,61}?[a-z0-9A-Z]\.com|net|cn|cc (:s[0-9]{1-4})?/$",
//        inputErrorMessage: '服务器地址输入错误'
      }).then(({ value }) => {
        this.changeServer(value)    // 修改服务器地址
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    changeServer (url) {
      this.checkServerUrl(url).then((checkRet) => {
        if (checkRet) {
          this.initData(url)
        }
      }).catch((err) => {
        console.error('inputServerErr', err)
        this.$message({
          type: 'error',
          showClose: true,
          message: '操作未生效，无效的服务器地址: ' + url
        })
      })
    },
    // 处理返回数据，处理成树形空间使用格式
    handleResultToTree (data) {
      let result = []
      if (_.isObject(data)) {
        for (let key of _.keys(data)) {
          if (_.isObject(data[key])) {
            result.push({
              label: key,
              children: this.handleResultToTree(data[key])
            })
          } else {
            result.push({
              label: key + ': ' + data[key]
            })
          }
        }
      } else {
        result.push({
          label: 'undefined' + ': ' + data
        })
      }
      return result
    },
    // 记录使用的api数据
    recordCommonUseApi (className, apiName) {
      let apiInfoObj = this.selectApi
      if (className && apiName) {
        apiInfoObj = {
          className: className,
          apiName: apiName
        }
      }
      let fullApiName = apiInfoObj['className'] + '_' + apiInfoObj['apiName']   // 完整api名称
      let server = _.kebabCase(this.server)
      if (_.has(this.commonUseApiList, server + '.' + fullApiName)) {
        let newUse = _.get(this.commonUseApiList, server + '.' + fullApiName + '.use') + 1
        this.commonUseApiList = _.set(_.cloneDeep(this.commonUseApiList), server + '.' + fullApiName + '.' + 'use', newUse)
      } else {
        let initData = {
          className: apiInfoObj['className'],
          apiName: apiInfoObj['apiName'],
          use: 1,
          server: server
        }
        this.commonUseApiList = _.set(_.cloneDeep(this.commonUseApiList), server + '.' + fullApiName, initData)
      }
    },
    removeCommonUseApi (className, apiName) {
      let fullName = className + '_' + apiName
      this.commonUseApiList = _.omit(this.commonUseApiList, _.kebabCase(this.server) + '.' + fullName)
    },
    recordCommonServerUrl (url) {
      let server = _.kebabCase(url)
      if (_.has(this.commonUseServerUrl, server)) {
        let newUse = _.get(this.commonUseServerUrl, server + '.use') + 1
        this.commonUseServerUrl = _.set(_.cloneDeep(this.commonUseServerUrl), server + '.' + 'use', newUse)
      } else {
        let initData = {
          use: 1,
          url: url,
          remark: ''
        }
        this.commonUseServerUrl = _.set(_.cloneDeep(this.commonUseServerUrl), server, initData)
      }
    },
    removeCommonServerUrl (url) {
      this.commonUseServerUrl = _.omit(this.commonUseServerUrl, _.kebabCase(url))
    },
    remarkCommonServerUrl (url, remark) {
      let server = _.kebabCase(url)
      if (_.has(this.commonUseServerUrl, server)) {
        this.commonUseServerUrl = _.set(_.cloneDeep(this.commonUseServerUrl), server + '.' + 'remark', remark)
      } else {
        let initData = {
          use: 1,
          url: server,
          remark: remark
        }
        this.commonUseServerUrl = _.set(_.cloneDeep(this.commonUseServerUrl), server, initData)
      }
    },
    openRemarkBox (url) {
      this.$prompt('输入备注', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.remarkCommonServerUrl(url, value)
        this.$message({
          type: 'success',
          message: '修改成功'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    }
  },
  computed: {
    api () {
      if (_.isEmpty(this.selectApi)) {
        return ''
      } else {
        return this.selectApi['className'] + '_' + this.selectApi['apiName']
      }
    },
    className () {
      if (_.isEmpty(this.selectApi)) {
        return ''
      } else {
        return this.selectApi['className']
      }
    },
    apiName () {
      if (_.isEmpty(this.selectApi)) {
        return ''
      } else {
        return this.selectApi['apiName']
      }
    },
    params () {
      return _.get(this.apiNameArr, [this.className, this.apiName])
    },
    // api执行时间
    apiDoTime () {
      if (_.has(this.result, 'debug.call.time')) {
        return this.result.debug.call.time
      } else {
        return null
      }
    },
    getCommonUseList () {
      let name = _.kebabCase(this.server)
      let apiList = _.get(this.commonUseApiList, name, {})
      return _.sortBy(apiList, function (n) {
        return -n['use']
      })
    },
    getCommonServerUrl () {
      return _.sortBy(this.commonUseServerUrl, function (n) {
        return -n['use']
      })
    },
    // 服务器地址  缓存 = 设置 > 默认
    server () {
      if (this.useServer) {
        return this.useServer
      } else {
        return this.defaultServer
      }
    }
  },
  filters: {
    toString
  },
  watch: {
    commonUseApiList: function (val, oldVal) {
      Cookies.set(COOKIE_COMMON_UES_API_LIST, val)
    },
    commonUseServerUrl: function (val, oldVal) {
      Cookies.set(COOKIE_COMMON_USE_SERVER_URL, val)
    }
  }
}
</script>
<style scoped>
  .navigate {
  }
  .list {
  }
  .main {
  }
  .status {
  }
  .all {
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  }
  .head {
    background-color: #1F2D3D;
    margin-bottom: 10px;
  }
  .row-api-info {
    margin-bottom: 10px;
  }
  .row-api-input {
    margin-bottom: 10px;
  }
  .row-api-output {
    margin-bottom: 10px;
  }
</style>
