import { initState } from "./observe";
import { initMixin } from './init';
import { query } from "./util";
import { Watcher } from "./observe/watcher";
import { compiler, compileToFunctions } from "./compile/compiler";
import { initRender, renderMixin } from "./render";
import { installRenderHelpers } from './core/instance/render-helpers/index'
import { lifecycleMixin } from "./lifecycle";
import { mountMixin } from "./platform/web/runtime";

function Vue(options){
    this._init(options)     //初始化vue
}

mountMixin(Vue)//源码里没有这个方法

//混入相关方法
initMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

Vue.prototype.$watch = function(key,hanlder){
    new Watcher(this,key,hanlder,{user:true})
}

Vue.compile = compileToFunctions

export default Vue
