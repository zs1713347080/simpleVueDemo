import { isUndef, isDef } from "../../shared/util";
import { isObject } from "../instance/render-helpers/render-list";
import { resolveConstructorOptions } from "../../init";
import VNode from "./vnode";
import { activeInstance, callHook } from "../../lifecycle";


export function createComponent(                        //创建组件
    Ctor,                       //构造函数
    data,           //标签上的属性
    context,        //执行上下文
    children,           //子节点
    tag             //组件名称
){
    if(isUndef(Ctor)){      //构造器没有定义？直接跳过
        return 
    }
    const baseCtor = context.$options._base


    //如果Ctor是一个对象，需要转换成构造器
    if(isObject(Ctor)){
        Ctor = baseCtor.extend(Ctor)
    }

    //异步组件
    let asyncFactory
    if(isUndef(Ctor.cid)){

    }

    data = data || {}

    //重新创建的构造器需要重新混入相关的属性，方法等。
    resolveConstructorOptions(Ctor)
    //和组件间通信相关的，暂时不考虑
    if(isDef(data.model)){

    }

//     // extract props
//   const propsData = extractPropsFromVNodeData(data, Ctor, tag)

//   // functional component
//   if (isTrue(Ctor.options.functional)) {
//     return createFunctionalComponent(Ctor, propsData, data, context, children)               //函数式组件相关的？？？
//   }

    //往组件节点上挂载相关的钩子函数
    installComponentHooks(data)

    //返回一个标记的vnode
    const name = Ctor.options.name || tag
    const vnode = new VNode(
        `vue-component-${Ctor.cid}${name?`-${name}`:''}`,
        data,
        undefined,
        undefined,
        undefined,
        context,
        { Ctor,tag,children },
        asyncFactory
    )

    return vnode

}


const componentVNodeHooks = {                                   //组件的钩子函数
    init (vnode, hydrating) {
        if(
            vnode.componentInstance &&
            !vnode.componentInstance._isDestoryed &&
            vnode.data.keepAlive
        ) {
            //keep-alive 组件
        } else {
            const child = vnode.componentInstance = createComponentInstanceForVnode(
                vnode,
                activeInstance
            )
             child.$mount(hydrating ? vnode.elm : undefined, hydrating);        //调用继承过来的mount方法
        }
    },

    prepatch(){

    },

    insert(vnode){
        const { context, componentInstance } = vnode
        if(!componentInstance._isMounted) {
            componentInstance._isMounted = true
            callHook(componentInstance, 'mounted')
        }
        if(vnode.data.keepAlive) {
            //暂时省略
        }
    },

    destroy(vnode){
        const  { componentInstance } = vnode
        if (!componentInstance._isDestroyed) {
            if (!vnode.data.keepAlive) {
              componentInstance.$destroy()                  //调用继承自vue构造器的destroy钩子
            } else {
            //   deactivateChildComponent(componentInstance, true /* direct */)         //先省略一下子
            }
          }
    }
}


const hooksToMerge = Object.keys(componentVNodeHooks)

function installComponentHooks(data){                               //给组件加上组件的钩子函数
    const hooks = data.hook || (data.hook = {})
    for(let i = 0;i< hooksToMerge.length;i++){
        const key = hooksToMerge[i]
        const existing = hooks[key]
        const toMerge = componentVNodeHooks[key]
        if(existing !== toMerge && !( existing && existing._merged )){
            hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
        }
    }
}

function mergeHook (newhook, existHook) {           //将新旧钩子合并为一个钩子函数
    const merged = (a,b) => {
        newhook(a,b)
        existHook(a,b)
    }
    merged._merged = true
    return merged
}

export function createComponentInstanceForVnode(vnode, parent){             // 给vnode创建一个组件实例上下文，其实就是创建组件实例
    const options = {
        _isComponent:true,
        _parentVnode:vnode,
        parent
    }

    const inlineTemplate = vnode.data.inlineTemplate
    if(isDef(inlineTemplate)){
        options.render = inlineTemplate.render
        options.staticRenderFns = inlineTemplate.staticRenderFns
    }
    return new vnode.componentOptions.Ctor(options)
}