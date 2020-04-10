import VNode, { createEmptyVNode } from './vnode'
import { isDef, isUndef } from '../../shared/util'

import { normalizeChildren,simpleNormalizeChildren } from '../helpers/normalize-children'
import { isReservedTag } from '../../platform/web/util/element'
import { createComponent } from './create-component'


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
    var Ctor
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

        
        if(isReservedTag(tag)){     //查看是否为html或者svg预留标签
            vnode = new VNode(
                tag, data, children,
                undefined, undefined, context
            )
                                            //去构造函数的components中查询是否注册了名和tag值一致的组件
        }else if((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
            //解析组件
            vnode = createComponent(Ctor, data, context, children, tag)
        }
    }
    return vnode
}


function resolveAsset(options, type, id){
    if(typeof id!=='string'){
        return 
    }
    var assets = options[type]
    if(hasOwn(assets, id)){ return assets[id] }     //返回构造器component  目前只有component
}




var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {                    //查看一个对象是否有key属性
  return hasOwnProperty.call(obj, key)
}