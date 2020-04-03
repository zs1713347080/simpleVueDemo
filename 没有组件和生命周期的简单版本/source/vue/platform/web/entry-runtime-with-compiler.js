import Vue from '../../index'

import { compileToFunctions } from '../../compile/compiler'

import { query } from "../../util"

export function initMount (Vue){
    const mount = Vue.prototype.$mount              //闭包保存mountComponent的引用
    return function (el, hydrating){
        el = el && query(el)
        const options = this.$options
        if(!options.render){                //如果用户没有提供render函数则执行模板编译流程
            let template = options.template
            if(template){                       //源码在这边还会有很多判断和相应的提示我就忽略掉了
                const { render, staticRenderFns } = compileToFunctions(template, {}, this)
                options.render = render;
                options.staticRenderFns = staticRenderFns
            }
        }
        return mount.call(this, el, hydrating)
    }
}


export default Vue