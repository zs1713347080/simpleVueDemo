import { pushTarget, popTarget } from "./dep";
import { nextTick } from "../util/nextTick";
import { callHook } from "../lifecycle";
import { remove } from "../shared/util";

let id = 0
export class Watcher{
    /**
     * 
     * @param {*} vm  
     * @param {*} exprOrFn 
     * @param {*} cb 
     * @param {*} opts 
     */
    //          vm,key,     handler,    {user:true}             侦听属性
    //          vm,cb       ,()=>{}    ,{lazy:true}             计算属性
    constructor(vm,exprOrFn,cb = ()=>{},opts={},isRenderWatcher){
        this.vm = vm;
        if(isRenderWatcher) {
            vm._watcher = this  //记录实例的渲染watcher
        }
        vm._watchers.push(this)     //将所有的watcher记录
        this.exprOrFn = exprOrFn;
        if(typeof exprOrFn==='function'){
            this.getter = exprOrFn;
        } else {
            this.getter = function(){
                return getValue(vm,exprOrFn)
            }
        }
        if(opts){
            this.user = !!opts.user; // 表示是用户watcher
            this.before = opts.before;
        }
        this.lazy = opts.lazy||false;
        this.dirty = this.lazy||false;
        this.active = true //表示是否在使用
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
        let i = this.deps.length
        while(i--){
            this.deps[i].depend();
        }
    }
    evaluate(){
        if(this.dirty){
            this.value = this.get();
            this.dirty = false;
        }
    }
    run(){      //watcher实例被notify最后会执行这个方法
        if(this.active && this.user){          //如果是侦听器的话
            let value = this.get();
            this.cb(value,this.value);
            this.value = value
        } else {
            this.getter()
        }
    }
    teardown(){ //将自身从所有的被依赖数据的订阅list中移除
        if (this.active) {
            if(!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this)
            }
            var i = this.deps.length
            while(i--) {
                this.deps[i].removeSub(this);
            }
            this.active = false
        }
    }
}
let has = {};
let queue = [];
function flushQueue(){
    queue.forEach(watcher=>{
        if(watcher.before){
            watcher.before();
        }
        watcher.run()
        has[watcher.id] = null;
        let vm = watcher.vm
        if(vm && vm._isMounted && !vm._isDestroyed){
            callHook(vm, 'updated')
        }
    })
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



function getValue(vm,expr){
    let keys = expr.trim().split('.');
    return keys.reduce((memo,current)=>{
        memo = memo[current];
        return memo
    },vm)
}
