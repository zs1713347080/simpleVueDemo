import { createElement } from "./core/vdom/create-element"
import { installRenderHelpers } from "./core/instance/render-helpers"
import { nextTick } from "./util/nextTick"


export function initRender (vm){
    vm._vnode = null                //the root of the child tree
    vm._staticTrees = null          // v-once cached trees
    //将createelement函数绑定到该实例，以便在内部获得正确的执行上下文
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)


    //这个是给用户使用的公共渲染函数
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}

export function renderMixin(Vue){       //给Vue原型加上一些公共方法

    installRenderHelpers(Vue.prototype)         //给原型加上_l _v 等方法

    //公共nextTick方法
    Vue.prototype.$nextTick = function (fn) {
        return nextTick(fn, this)
    }

    Vue.prototype._render = function () {
        const vm = this;
        const { render, _parentVnode } = vm.$options;

        if(_parentVnode){           //跟插槽相关的逻辑，先忽略

        }

        vm.$vnode = _parentVnode

        let vnode
        vnode = render.call(vm, vm.$createElement)             //源码这边是代理了的，我就配置代理了

        if(Array.isArray(vnode) && vnode.length === 1){         //如果是数组并且长度为1，扁平化
            vnode = vnode[0]
        }

        return vnode
    }
}