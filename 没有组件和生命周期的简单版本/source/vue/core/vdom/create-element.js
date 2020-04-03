import VNode, { createEmptyVNode } from './vnode'

import { normalizeChildren,simpleNormalizeChildren } from '../helpers/normalize-children'


const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

export function createElement(
    context,                    //函数执行上下文，一般是一个vm实例
    tag,                        
    data,
    children,
    normalizationType,          //规范化类型
    alwaysNormalize             //是否规范化
){
    if(Array.isArray(data) || typeof data !== 'object'){        //是数组或者普通类型
        normalizationType = children;
        children = data;
        data = undefined
    }
    if(alwaysNormalize) {
        normalizationType = ALWAYS_NORMALIZE                    //标记
    }
    return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement(
    context,
    tag,
    data,
    children,
    normalizationType
){
    if(!tag){
        return createEmptyVNode();
    }
    let vnode, ns
    if (normalizationType === ALWAYS_NORMALIZE) {                   //深度数据规范化
        children = normalizeChildren(children);
      } else if (normalizationType === SIMPLE_NORMALIZE) {
        children = simpleNormalizeChildren(children);               //浅数据规范化
      }
    if(typeof tag === 'string'){
        vnode = new VNode(
            tag, data, children,
            undefined, undefined, context
        )
    }
    return vnode
}


