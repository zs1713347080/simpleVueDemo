import { createElement } from "./core/vdom/create-element"


export function initRender (vm){
    vm._vnode = null                //the root of the child tree
    vm._staticTrees = null          // v-once cached trees
    const options = vm.$options
    const parentVnode = vm.$vnode = options._parentVnode
    const renderContext = parentVnode && parentVnode.context            //渲染时的上下文
    // vm.$slot = resolveSlot(options._renderChildren, renderContext)       //先不考虑插槽
    // vm.$scopedSlots = emptyObject


    //将createelement函数绑定到该实例，以便在内部获得正确的执行上下文
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)


    //这个是给用户使用的公共渲染函数
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}