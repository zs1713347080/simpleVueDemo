import { initState } from "./observe";
import { initMixin } from './init';
import { query } from "./util";
import { Watcher } from "./observe/watcher";
import { compiler, compileToFunctions } from "./compile/compiler";
import { initRender, renderMixin } from "./render";
import { installRenderHelpers } from './core/instance/render-helpers/index'
import { lifecycleMixin } from "./lifecycle";
import { mountMixin } from "./platform/web/runtime";
import { initGlobalAPI } from './core/global-api/index'

function Vue(options){
    this._init(options)     //初始化vue
}

//混入相关方法
initMixin(Vue)                  //给vue原型混入初始化需要的方法

lifecycleMixin(Vue)             //给vue原型混入生命周期需要的方法

renderMixin(Vue)                //给vue原型混入render过程需要的方法

Vue.prototype.$watch = function(key,hanlder){           //公共的$watch方法
    new Watcher(this,key,hanlder,{user:true})
}

Vue.compile = compileToFunctions            //公共的模板编译方法complie


initGlobalAPI(Vue)          //混入全局api，源码不是在这里写的

mountMixin(Vue)//源码里没有这个方法


export default Vue
