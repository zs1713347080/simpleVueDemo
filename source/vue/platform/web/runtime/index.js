import Vue from '../../../index'
import { query } from '../../../util'
import { mountComponent } from '../../../lifecycle'
import { initMount } from '../entry-runtime-with-compiler'
import { patch } from './patch'


export function mountMixin(Vue){

    Vue.prototype.__patch__ = patch                 //源码在这里会判断是否在浏览器环境中，如果在浏览器环境中才会挂载patch方法

    Vue.prototype.$mount = function (el, hydrating){
        el = el ? query(el) : undefined             //源码在这里会进行一个是否处于浏览器环境的判断
        return mountComponent(this, el, hydrating)
    }
    
    Vue.prototype.$mount = initMount(Vue)
}



export default Vue