import { observe } from "./observer";

let oldArrayPrototypeMethods = Array.prototype;
export let arrayMethods = Object.create(oldArrayPrototypeMethods)

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]
methods.forEach(methdod=>{
    arrayMethods[methdod] = function (...args){
        let result = oldArrayPrototypeMethods[methdod].apply(this,args)

        let instered;
        switch(methdod){
            case 'push':
                case 'unshift':
                    instered = args
                    break;
            case 'splice':
                instered = args.slice(2)
                break;
            default:
                break;
        }
        if(instered) {observeArray(instered)};

        //监听到上述能改变数组数据的变化，通知数组对应的Observer实例中的dep调用notify方法
        this.__ob__.dep.notify();
        return result;  //正常返回旧原型方法的返回值
    }
})
export function observeArray(instered){
    for(let i = 0,l = instered.length;i<l;i++){
        observe(instered[i])
    }
}
export function deepDependArray(value){
    for(let i = 0,l = value.length;i<l;i++){
        let currentItem = value[i];
        currentItem.__ob__&&currentItem.__ob__.dep.depend();
        if(Array.isArray(currentItem)){
            deepDependArray(currentItem)
        }
    }
}