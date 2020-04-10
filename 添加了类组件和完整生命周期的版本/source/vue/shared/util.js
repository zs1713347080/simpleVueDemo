

const _toString = Object.prototype.toString

export function makeMap(str,expectsLowerCase){          //用于将枚举的标签存到map中，用于以后判断
    const map = Object.create(null);
    const list = str.split(',')
    for(let i = 0,l = list.length;i<l;i++){
        map[list[i]] = true
    }
    return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

export function extend (to, _from) {               //扩展对象属性的函数
    for (const key in _from) {
      to[key] = _from[key]
    }
    return to
  }
  
export function isDef (v) {
  return v !== undefined && v !== null
}

export function isUndef (v) {
  return v === undefined || v === null
}

export function isTrue(v){
  return v===true
}

/**
 * Check if value is primitive.     基本类型
 */
export function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

export function toString(val){
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString )
      ? JSON.stringify(val, null, 2)      //对象或者数组
      : String(val)                       //字符串
}

export function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}


const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function remove (arr, item) {
  if(arr.length) {
    const index = arr.indexOf(item)
    if(index>-1) {
      return arr.splice(index, 1)
    }
  }
}