import { observe } from "./observer";

let oldArrayPrototypeMethods = Array.prototype;
export let arrayMethods = Object.create(oldArrayPrototypeMethods)               //克隆一个array的原型

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
    arrayMethods[methdod] = function (...args){                         //对原型上的会改变数组本身的方法进行劫持
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
        if(instered) {observeArray(instered)};                      //对新加入的数据进行观察

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
export function deepDependArray(value){                 //深度观察数组
    for(let i = 0,l = value.length;i<l;i++){
        let currentItem = value[i];
        currentItem.__ob__&&currentItem.__ob__.dep.depend();
        if(Array.isArray(currentItem)){
            deepDependArray(currentItem)
        }
    }
}