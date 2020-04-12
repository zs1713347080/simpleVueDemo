import { popTarget, pushTarget } from "./dep";
import { nextTick } from "../util/next-Tick";

let id = 0
export class Watcher{
    /** 
    * 
    * @param {*} vm 当前组件的实例 new Vue 
    * @param {*} exprOrFn 用户可能传入的是一个表达式 也有可能是一个函数
    * @param {*} cb 用户传入的回调函数 vm.$watch
    * @param {*} opts 一些其他参数
    * @param {*} ifRender 是不是渲染watcher
    */
    constructor (vm,exprOrFn,cb = ()=>{},opts = {}, ifRender) {
        this.vm = vm;
        this.exprOrFn = exprOrFn
        if(typeof exprOrFn === 'function') {
            this.getter = exprOrFn
        }

        this.deps = []
        this.depsId = new Set();
        this.id = id++;
        this.get()
    }
    get(){
        pushTarget(this);
        this.getter.call(this.vm)                    //计算时方便其依赖数据收集依赖
        popTarget()
    }
    depend(){
        let i = this.deps.length;
        while(i--) {
            this.deps[i].depend()               //让dep记住自己
        }
    }
    run() {                                     //执行回调
        this.getter()
    }
    update(){                                   //将自身放入watcher队列中等待
        queueWatcher(this)
    }
}

//需要清空的watcher队列
let queue = []
let has = {}

function flushQueue() {                         //清空队列的函数
    queue.forEach(watcher=> {
        watcher.run();
        has[watcher.id] = null
    })
    queue = []
}

function queueWatcher(watcher) {                    //将watcher放入等待队列并启动nextTick
    let id = watcher.id
    if(has[id]==null) {
        has[id] = true;
        queue.push(watcher)

        nextTick(flushQueue)
    }
}