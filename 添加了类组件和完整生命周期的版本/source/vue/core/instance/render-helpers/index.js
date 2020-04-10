
import { renderList } from './render-list'
import { createTextVNode, createEmptyVNode } from '../../vdom/vnode'
import { toString } from '../../../shared/util'
import { markOnce, renderStatic } from './render-static'

export function installRenderHelpers(target){
    target._o = markOnce

    target._l = renderList                                  //
    target._m = renderStatic
    target._v = createTextVNode
    target._e = createEmptyVNode
    target._s = toString
}