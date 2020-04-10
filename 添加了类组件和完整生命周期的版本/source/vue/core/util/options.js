import { LIFECYCLE_HOOKS, ASSET_TYPES } from '../../shared/constants'
import { extend } from '../../shared/util';
import { hasOwn } from '../../shared/util'

const strats = {};

LIFECYCLE_HOOKS.forEach(hook => {               //初始化合并生命周期钩子的函数
    strats[hook] = mergeHook
})

function mergeHook(parentVal, childVal){
    const res = childVal
        ? parentVal
            ? parentVal.concat(childVal)        //父子都有就合并
            : Array.isArray(childVal)           //父不存在，子切换成数组
                ? childVal
                : [childVal]
        : parentVal
    return res              //无论是对象还是数组最后都切换成数组
        ?   dedupeHooks(res)
        :   res
}

function dedupeHooks(hooks) {               //切换成数组
    const res = []
    for(let i = 0;i<hooks.length;i++) {
        if(res.indexOf(hooks[i]) === -1){
            res.push(hooks[i])
        }
    }
    return res
}


ASSET_TYPES.forEach(type=>{                     //directive/components/filters
    strats[type + 's'] = mergeAssets
})

function mergeAssets (parentVal, childVal) {
    const res = Object.create(parentVal || null)
    if(childVal) {
        return extend(res, childVal)            //合并
    } else {
        return res
    }
}

strats.watch = function (parentVal, childVal) {
    if(!childVal)  return Object.create(parentVal);
    if(!parentVal) return childVal;
    //如果父子都存在
    const ret = {}
    extend(ret, parentVal)  //父属性扩展到ret对象上
    for(const key in childVal) {
        let parent = ret[key]
        const child = childVal[key]
        if(parent && !Array.isArray(parent)) {              //别管是啥都改成array格式
            parent = [parent]
        }
        ret[key] = parent
        ? parent.concat(child)                      //父子合并
        : Array.isArray(child)? child : [child]  
    }
    return ret
}

strats.methods = 
strats.computed = function(parentVal,childVal){             //单纯的函数合并
    if(!parentVal) return childVal;
    const ret = Object.create(null);
    extend(ret, parentVal)
    if(childVal) extend(ret, childVal);
    return ret
}

export function mergeOptions (parent, child, vm){
    //简化合并过程
    if(typeof child === 'function') {
        child = child.options
    }

    if(!child._base) {
        if(child.extends) {
            parent = mergeOptions(parent, child.extends, vm)
        }
        if(child.mixins) {
            for(let i = 0,l = child.mixins.length; i<l ;i++) {
                parent = mergeOptions(parent, child.mixins[i], vm)
            }
        }
    }
    let options = {}
    for(let key in parent) {
        mergeField(key)
    }
    for(let key in child) {
        if(!hasOwn(parent, key)) {
            mergeField(key)
        }
    }
    function mergeField(key){
        const strat = strats[key] || defaultStrat
        options[key] = strat(parent[key], child[key])
    }
    return options
}



var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };