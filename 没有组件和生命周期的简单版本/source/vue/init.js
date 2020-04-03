import { initLifecycle } from "./lifecycle";
import { initRender } from "./render";
import { initState } from "./observe";


let uid = 0
export function initMixin(Vue){
    Vue.prototype._init = function (options){

        let vm = this;

        vm.$options = options;

        vm.uid = uid++;
        
        // a flag to avoid this being observed

        vm._isVue = true
        
        //expose real self

        vm._self = vm;

        initLifecycle(vm)               //初始化生命周期的一些状态

        initRender(vm)          //初始化render相关的方法

        initState(vm)           //初始化数据   数据observe是在这一步哦


        if(vm.$options.el){             //有挂载点的话调用mounted
            vm.$mount(vm.$options.el);
        }   
    }
}