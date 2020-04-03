import { namespaceMap } from '../util/element'

//patch的适配层，基本上都是一些原生dom方法包装了一下

export function createElement (tagName, vnode) {
    const elm = document.createElement(tagName)
    return elm
}


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
  