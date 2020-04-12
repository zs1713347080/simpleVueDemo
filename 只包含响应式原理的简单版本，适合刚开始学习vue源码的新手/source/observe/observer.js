import { Dep } from "./dep";
export function observe(data){                  //响应式定义的入口函数
    if (typeof data!=='object' || data == null) {
        return   //不是对象或者是null就不需要观察
    }
    return new Observer(data)
}
class Observer{
    constructor(value) {
        this.value = value;
        this.dep = new Dep()
        Object.defineProperty(value, '__ob__',{          //把observer实例代理到被观察的对象的__ob__属性下
            value:this,
            enumerable: false,      //不可枚举
            writable: true,
            configurable: true
        })
        if(Array.isArray(value)) {          //如果类型是数组的话

        } else {                            //不是数组就是object
            this.walk(value)
        }
    }
    walk(obj){
        const keys = Object.keys(obj)
        for(let i =0,l = keys.length;i<l;i++){
            defineReactive(obj, keys[i])
        }
    }
}
export function defineReactive(obj, key) {
    let value = obj[key]
    let dep = new Dep();
    Object.defineProperty(obj,key,{
        get(){
            if(Dep.target) {
                dep.addSub(Dep.target)                  //收集依赖
            }
            return value
        },
        set(newValue) {
            if(newValue === value) {
                return ;
            } else {
                observe(newValue);                      //观察新数据
                value = newValue;                       //更新数据
                dep.notify()                            //通知依赖更新
            }
        }
    })

}