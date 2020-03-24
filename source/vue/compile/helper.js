import { parseFilters } from "./parser/filter-parser"

export function getAndRemoveAttr (                  //用于删除节点中的属性
    el,
    name,
    removeFromMap
  ) {
    let val
    if ((val = el.attrsMap[name]) != null) {
      const list = el.attrsList
      for (let i = 0, l = list.length; i < l; i++) {
        if (list[i].name === name) {
          list.splice(i, 1)
          break
        }
      }
    }
    if (removeFromMap) {
      delete el.attrsMap[name]
    }
    return val
  }
  export function getBindingAttr (el,name,getStatic
  ) {
    const dynamicValue =
      getAndRemoveAttr(el, ':' + name) ||
      getAndRemoveAttr(el, 'v-bind:' + name)
    if (dynamicValue != null) {                 //如果有动态属性的话
    //   return parseFilters(dynamicValue)           //源码里会调用这个方法，我抄下来了，但是不明白，在下水平不够，看不懂
        return dynamicValue
    } else if (getStatic !== false) {
      const staticValue = getAndRemoveAttr(el, name)
      if (staticValue != null) {
        return JSON.stringify(staticValue)
      }
    }
  }

  export function addAttr (el, name, value, range, dynamic) {
    const attrs = dynamic
      ? (el.dynamicAttrs || (el.dynamicAttrs = []))
      : (el.attrs || (el.attrs = []))
    attrs.push(rangeSetItem({ name, value, dynamic }, range))
    el.plain = false
  }

  
function rangeSetItem (
    item,
    range
  ) {
    if (range) {
      if (range.start != null) {
        item.start = range.start
      }
      if (range.end != null) {
        item.end = range.end
      }
    }
    return item
  }