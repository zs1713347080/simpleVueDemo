import { initLifecycle } from "./lifecycle";
import { initRender } from "./render";
import { initState } from "./observe";


let uid = 0
export function initMixin(Vue){
    Vue.prototype._init = function (options){
        //初始化
        let vm = this;
        vm.$options = options;
        vm.uid = uid++;
        
        // a flag to avoid this being observed

        vm._isVue = true

        // initProxy(vm)

        // console.log('vm.prototype',vm)
        // debugger
        console.log('vue实例对象',vm)
        //expose real self

        vm._self = vm;

        initLifecycle(vm)               //初始化生命周期的一些状态
        // initEvents(vm)               //事件部分逻辑先忽略
        initRender(vm)          
        initState(vm)


        if(vm.$options.el){ //有挂载点的话调用mounted
            vm.$mount(vm.$options.el);
        }   
    }
}