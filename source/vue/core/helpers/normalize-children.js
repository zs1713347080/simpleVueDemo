import { isPrimitive, isUndef, isDef } from '../../shared/util'
import { createTextVNode } from '../vdom/vnode'

export function normalizeChildren(children){
    return isPrimitive(children)
    ?
        [createTextVNode(children)]         //如果是普通类型，直接创建文本节点
    :   Array.isArray(children)             //如果是数组类型则进一步规范化格式
        ? normalizeArrayChildren(children)  //正式的规范化才刚刚开始
        : undefined                         //不是数组就丢掉不要了
}

function normalizeArrayChildren(children, nestedIndex){
    const res = [];
    let i, c, lastIndex, last;
    for(i = 0;i<children.length;i++){
        c = children[i];
        if(isUndef(c) || typeof c === 'boolean') continue   //跳过空姐点或者boolean节点
        lastIndex = res.length -1;
        last = res[lastIndex];                  //记录栈尾
        if(Array.isArray(c)){
            if(c.length>0){
                c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)          //递归规范化子节点
                if(isTextNode(c[0]) && isTextNode(last)){                           //如果出现连续的文本节点就合并文本内容 
                    res[lastIndex] = createTextVNode(last.text + (c[0]).text)
                    c.shift()
                }
                res.push.apply(res, c)          //将格式化好的c push到res中
            }
        } else if (isPrimitive(c)){         //是普通类型不知道是干吗用的，看源码注释是ssr渲染用的？先不写了，如果后面需要就补上

        } else{
            if(isTextNode(c) && isTextNode(last)){
                res[lastIndex] = createTextVNode(last.text + c.text) //如果是连续的文本标签，就把文本内容合并
            } else {
                if(children._isVList &&                     //如果有_isVList标记说明是带有v-for的          
                    isDef(c.tag) &&
                    isUndef(c.key) &&
                    isDef(nestedIndex)){
                        c.key = `__vlist${nestedIndex}_${i}__`      //给他加上key
                    }
                res.push(c)
            }
        }
    }
    return res
}
//跟normalizeArrayChildren的区别是这个函数只会规范化一层，所以叫simple
export function simpleNormalizeChildren (children) {
    for (let i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)           //将children中的子数组降维
      }
    }
    return children
  }

function isTextNode (node) {
    return isDef(node) && isDef(node.text) && !node.isComment
  }