import { initMixin } from './init';
import { Watcher } from "./observe/watcher";
import { compileToFunctions } from "./compile/compiler";
import { renderMixin } from "./render";
import { lifecycleMixin } from "./lifecycle";
import { mountMixin } from "./platform/web/runtime";

function Vue(options){
    this._init(options)     //初始化vue
}

mountMixin(Vue)         //源码里没有这个方法            混入mount方法

//混入相关方法
initMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

Vue.prototype.$watch = function(key,hanlder){           //定义全局的$watch方法，用于监听实例上的数据
    new Watcher(this,key,hanlder,{user:true})
}

Vue.compile = compileToFunctions

export default Vue
