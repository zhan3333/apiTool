<template>
  <div>
    <!--头部-->
    <el-row class="head">
      <el-col :span="24" class="navigate">
      </el-col>
    </el-row>
    <!--中间-->
    <el-row :gutter="10">
      <!--api列表-->
      <el-col :span="6" class="list">
        <el-menu default-active="2" class="el-menu-vertical-demo" theme="light"  v-for="(className, key) in classNameArr">
          <el-submenu :index="className">
            <template slot="title">{{className}}</template>
            <template v-for="(apiName, key2) in getApiArrByClassName(className)">
              <div @click="clickApi(className, apiName)">
                <el-menu-item :index="apiName" v-text="apiName"></el-menu-item>
              </div>
            </template>
          </el-submenu>
        </el-menu>
      </el-col>
      <!--表单-->
      <el-col :span="18" class="main">
        <el-row>
          <el-card class="box-card">
            <el-tag>api:</el-tag>
            <el-tag v-text="api"  v-show="api"></el-tag>
            <el-tag v-show="!api">请选择api</el-tag>
          </el-card>
        </el-row>
        <!--输入-->
        <el-row v-show="api">
          <el-card>
            <div slot="header" class="clearfix">
              <el-tag>输入参数</el-tag>
            </div>
            <el-form label-position="top" onkeydown="if(event.keyCode==13){return false;}">
              <template v-for="param in params">
                <el-form-item :label="param">
                  <el-input :value="form[param]" @input="form[param] = arguments[0]"></el-input>
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
        <el-row v-show="api">
          <el-card>
            <div slot="header" class="clearfix">
              <el-tag v-text="">返回结果:</el-tag>
              <el-tag>耗时:{{apiDoTime}}ms</el-tag>
            </div>
            <el-tree :data="treeResult" :props="defaultProps"></el-tree>
          </el-card>
        </el-row>
      </el-col>
    </el-row>
    <!--尾部-->
    <el-row type="flex" justify="end">
      <el-col :span="24" class="status">
        <el-tag v-text="server"  type="success"></el-tag>
        <el-button size="small" type="primary" @click.native="inputServer">修改</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script type="text/ecmascript-6">
import hprose from '../static/hprose/hprose-html5.src'
// import {client} from '../common/hprose/hprose-vue'
import {toString} from '../common/filter/util'
let _ = require('lodash')
let $ = require('jQuery')
export default {
  name: 'zhan',
  data () {
    return {
      // hprose对象
      client: {},
      // 服务器地址
      server: 'http://z.zhannnnn.top',
      classNameArr: [],
      apiNameArr: [],
      selectApi: [],     // 选中的api，用于界面显示
      // 表单数据
      form: {},
      // api返回数据
      result: {},
      // 树形图使用数据
      treeResult: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  mounted () {
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
      this.selectApi = [className, apiName]
    },
    // 提交表单
    onSubmit () {
      console.log('submit!')
      console.log('form: ', this.form)
      if (!this.api) {
        console.error('未选择接口')
        return ''
      }
      let args = {}
      for (let key of _.keys(this.form)) {
        _.set(args, key, $.parseJSON(this.form[key]))
      }
      console.log('args => ', args)
      let promise = this.client.invoke(this.api, [{data: args}])
      promise.then((result) => {
        console.info('接口' + this.api + '返回数据 :', result)
        this.result = result
        this.treeResult = this.handleResultToTree(result)
      }).catch((error) => {
        console.error('接口' + this.api + '返回错误: ', error)
      })
      return false
    },
    cleanData () {
      this.selectApi = []
      this.result = {}
      this.treeResult = []
    },
    initData () {
      if (this.server) {
        this.client = hprose.Client.create(this.server)
        let promise = this.client.invoke('Test_getApiList')
        promise.then((data) => {
          console.log('get apiList: ', data)
          data = _.omit(data, ['ret', 'debug'])
          this.apiNameArr = data
          this.classNameArr = _.keys(data)
        }).catch((err) => {
          console.error(err)
        })
      }
    },
    inputServer () {
      this.$prompt('请输入服务器地址', '提示', {
//        inputPattern: "^((https|http|ftp|rtsp|mms)://)?[a-z0-9A-Z]{3}\.[a-z0-9A-Z][a-z0-9A-Z]{0,61}?[a-z0-9A-Z]\.com|net|cn|cc (:s[0-9]{1-4})?/$",
//        inputErrorMessage: '服务器地址输入错误'
      }).then(({ value }) => {
        this.server = value
        this.$message({
          type: 'success',
          message: '服务器地址为: ' + value
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
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
          label: 'undefine' + ': ' + data
        })
      }
      return result
    }
  },
  watch: {
    server: function () {
      this.initData()
    }
  },
  computed: {
    api () {
      if (_.isEmpty(this.selectApi)) {
        return ''
      } else {
        return this.selectApi[0] + '_' + this.selectApi[1]
      }
    },
    className () {
      if (_.isEmpty(this.selectApi)) {
        return ''
      } else {
        return this.selectApi[0]
      }
    },
    apiName () {
      if (_.isEmpty(this.selectApi)) {
        return ''
      } else {
        return this.selectApi[1]
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
    }
  },
  filters: {
    toString
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
  }
</style>
