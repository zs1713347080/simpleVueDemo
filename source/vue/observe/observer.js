import { Dep } from "./dep";
import { arrayMethods, deepDependArray, observeArray } from "./array";

export function observe(data){
    if(typeof data !== 'object' || data == null){
        return 
    }
    return new Observer(data);
}
export class Observer{
    constructor(data){
        // this.type = 'notArray';
        this.dep = new Dep()    //为数组在该实例上单独加一个dep属性
        Object.defineProperty(data,'__ob__',{
            get:()=>{
                return this //在该对象上加上__ob__属性代理对应的Observer实例 
            }
        })

        if(Array.isArray(data)){
            // this.type = 'Array'
            data.__proto__ = arrayMethods   //绑定被劫持了之后的原型对象

            observeArray(data)
        } else {
            this.walk(data)
        }
    }
    walk(data){ 
        let keys = Object.keys(data);
        for(let i = 0,l = keys.length;i<l;i++){
            let key = keys[i]
            let value = data[key];
            defineReactive(data,key,value)
        }
    }
}
export function defineReactive(data,key,value){
    //递归观察
    let childOb = observe(value)
    let dep = new Dep()
    Object.defineProperty(data,key,{
        get(){
            if(Dep.target){
                dep.addSub(Dep.target);
                if(childOb){
                    childOb.dep.depend()
                    deepDependArray(value)
                }
            }
            return value
        },
        set(newValue){
            if(value!== newValue){
                observe(newValue);
                value = newValue
                dep.notify()
            } else {
                return;
            }
        }
    })
}