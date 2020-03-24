import { initState } from "./observe";
import { initMixin } from './init';
import { query } from "./util";
import { Watcher } from "./observe/watcher";
import { compiler, compileToFunctions } from "./compile/compiler";
import { initRender } from "./render";

import { installRenderHelpers } from './core/instance/render-helpers/index'
import { lifecycleMixin } from "./lifecycle";
// import { mountMixin } from "./platform/web/runtime";

export function Vue(options){
    this._init(options)     //初始化vue
}

// mountMixin(Vue)//源码里没有这个方法

//混入相关方法
initMixin(Vue)
lifecycleMixin(Vue)
// Vue.prototype._init = function (options){
//     //初始化
//     let vm = this;
//     vm.$options = options;
    
//     //初始化数据
//     initState(vm);
//     initRender(vm)
//     if(vm.$options.el){ //有挂载点的话调用mounted
//         vm.$mounted();
//     }   
// }

// let oldVnode
// Vue.prototype._update = function(){
//     let vm = this;
//     let el = vm.$el;
//     installRenderHelpers(vm)

//     oldVnode = vm.$options.render.apply(vm)
//     console.log('最新的vnode树\n',oldVnode)
//     // let node = document.createDocumentFragment();
//     // while(el.firstChild){
//     //     node.appendChild(el.firstChild)
//     // }
//     // compiler(node,this);
//     // el.appendChild(node)

// }
// Vue.prototype.$mounted = function(){
//     let vm = this;
//     let el = vm.$options.el;
//     let options = vm.$options
//     el = vm.$el = query(el);
//     if(!options.render){
//         const { render, staticRenderFns } = compileToFunctions(vm.$options.template)    //生成render函数  这里是编译开始的最终入口----------
    
//         options.render = render;
//         options.staticRenderFns = staticRenderFns
//         console.log('render函数\n',render)
//     }

//     let updateComponent = () =>{
//         vm._update()
//     }
//     new Watcher(vm,updateComponent)//创建渲染watcher
// }
Vue.prototype.$watch = function(key,hanlder){
    new Watcher(this,key,hanlder,{user:true})
}

Vue.compile = compileToFunctions

// export default Vue
