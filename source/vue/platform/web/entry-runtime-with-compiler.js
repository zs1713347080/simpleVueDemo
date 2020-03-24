import Vue from './runtime/index'

import { compileToFunctions } from '../../compile/compiler'

import { query } from "../../util"

console.log(Vue)

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (el, hydrating){
    el = el && query(el)
    console.log(el)
    const options = this.$options
    console.log(options)
    if(!options.render){                //如果用户没有提供render函数则执行模板编译流程
        let template = options.template

    }
}
// export function initMount (Vue){
//     console.log('/*/*/*/*/*/*/*/**')
//     const mount = Vue.prototype.$mount              //闭包保存mountComponent的引用
//     return function (el, hydrating){
//         console.log('$mount调用',mount)
//         el = el && query(el)
//         console.log(el)
//         const options = this.$options
//         console.log(options)
//         if(!options.render){                //如果用户没有提供render函数则执行模板编译流程
//             let template = options.template

//         }
//     }
// }

Vue.compile = compileToFunctions

export default Vue