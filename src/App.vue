<template>
  <div id="app">
    <zhan></zhan>
  </div>
</template>

<script>
import Zhan from './pages/Zhan'

export default {
  name: 'app',
  components: {
    Zhan
  },
  methods: {
  },
  computed: {
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  /*-webkit-font-smoothing: antialiased;*/
  /*-moz-osx-font-smoothing: grayscale;*/
  color: #2c3e50;
}
.head .el-menu--horizontal .el-submenu .el-submenu__title {
  height: 40px!important;
  line-height: 40px!important;
}
.head .el-menu--horizontal .el-submenu>.el-menu {
  top: 40px!important;
}

.apiList .el-submenu__title {
  height: 35px;
  padding:0 5px;
  line-height: 35px;
}

.apiList .el-submenu .el-menu-item {
  padding:0 5px;
  height: 35px;
  line-height: 35px;
}

</style>
