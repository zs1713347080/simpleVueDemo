import { namespaceMap } from '../util/element'

//patch的适配层，基本上都是一些原生dom方法包装了一下

export function createElement (tagName, vnode) {
    const elm = document.createElement(tagName)
    return elm
    // if (tagName !== 'select') {                                  //源码在这里做了一个兼容性的处理
    //   return elm
    // }
    // // false or null will remove the attribute but undefined will not
    // if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    //   elm.setAttribute('multiple', 'multiple')
    // }
    // return elm
}

// export function createElementNS (namespace, tagName) {                      //为了适应多端，咱们不考虑这个
//     return document.createElementNS(namespaceMap[namespace], tagName)
// }

export function createTextNode(text){
    return document.createTextNode(text)
}

export function createComment(text){
    return document.createComment(text)
}

export function insertBefore(parentNode, newNode, referenceNode){
    parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild(node, child){
    node.removeChild(child)
}

export function appendChild(node, child){
    node.appendChild(child)
}

export function parentNode(node){
    return node.parentNode
}

export function nextSibling(node){
    return node.nextSibling
}

export function tagName(node){
    return node.tagName
}

export function setTextContent(node, text){
    node.textContent = text
}


// export function setStyleScope (node, scopeId) {                  //插槽相关的暂时忽略
//     node.setAttribute(scopeId, '')
//   }
  