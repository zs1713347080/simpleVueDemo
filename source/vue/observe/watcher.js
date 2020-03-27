import { pushTarget, popTarget } from "./dep";
import { nextTick } from "../util/nextTick";
import { getValue } from "../compile/compiler";

let id = 0
export class Watcher{
    /**
     * 
     * @param {*} vm  
     * @param {*} exprOrFn 
     * @param {*} cb 
     * @param {*} opts 
     */
    //          vm,key,     handler,    {user:true}
    //          vm,cb       ,()=>{}    ,{lazy:true}             计算属性
    constructor(vm,exprOrFn,cb = ()=>{},opts={},isRenderWatcher){
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        if(typeof exprOrFn==='function'){
            this.getter = exprOrFn;
        } else {
            this.getter = function(){
                return getValue(vm,exprOrFn)
            }
        }
        if(opts.user){
            this.user = true // 表示是用户watcher
        }
        this.lazy = opts.lazy||false;
        this.dirty = this.lazy||false;
        this.cb = cb;
        this.opts = opts;
        this.id = id++;
        this.deps = []
        this.depsId = new Set();
        this.value = this.lazy? undefined : this.get();
    }
    get(){
        pushTarget(this);
       let value =  this.getter.call(this.vm);
        popTarget();
        return value
    }
    update(){
        if(this.lazy){  //如果是计算属性
            this.dirty = true;  //计算属性依赖的值变化了 待会再被取值的时候需要重新求值
        }else {
            queueWatcher(this);
        }
    }
    addDep(dep){
        let id = dep.id
        if(!this.depsId.has(id)){
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this);   //双向记录 
        }
    }
    depend(){
        console.log('调用watcher的depend方法')
        let i = this.deps.length
        while(i--){
            this.deps[i].depend();
        }
    }
    evaluate(){
        console.log('调用watcher的evaluate方法')
        if(this.dirty){
            this.value = this.get();
            this.dirty = false;
        }
    }
    run(){      //watcher实例被notify最后会执行这个方法
        if(this.user){          //如果是侦听器的话
            let value = this.get();
            this.cb(value,this.value);
            this.value = value
        } else {
            this.getter()
        }
    }
}
let has = {};
let queue = [];
function flushQueue(){
    queue.forEach(watcher=>watcher.run())
    has = {};
    queue = []
}
function queueWatcher(watcher){
    let id = watcher.id;
    if(has[id] == null){
        has[id] = true
        queue.push(watcher);

        nextTick(flushQueue)
    }
}
