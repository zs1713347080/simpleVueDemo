import { observe } from "./observer";
import { Watcher } from "./watcher";
import { Dep } from "./dep";

export function initState(vm){
    let opts = vm.$options

    if (opts.methods) initMethods(vm, opts.methods)
    if(opts.data){
        initData(vm);
    }
    if(opts.computed){
        initComputed(vm,opts.computed)
    }
    if(opts.watch){
        initWatch(vm)
    }
}
function initData(vm){
    let data = vm.$options.data
    data = vm._data = typeof data === 'function'?data.call(vm):data||{}
    //代理数据
    for(let key in data){
        proxy(vm,'_data',key)
    }
    observe(vm._data);//观察数据
}
function proxy(vm,source,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },
        set(value){
            vm[source][key] = value
        }
    })
}
function createComputedGetter(vm,key){
    let watcher = vm._watchersComputed[key];
    return function(){
        if(watcher){
            if(watcher.dirty){
                watcher.evaluate();
            }
            if(Dep.target){
                watcher.depend();
            }
        }
        return watcher.value
    }
}
function initComputed(vm,computed){
    let watchers = vm._watchersComputed = Object.create(null);
    for(let key in computed){
        let cb = computed[key];
        watchers[key] = new Watcher(vm,cb,()=>{},{lazy:true})
        Object.defineProperty(vm,key,{
            get:createComputedGetter(vm,key)
        })
    }
}

function createWatcher(vm,key,hanlder){
    return vm.$watch(key,hanlder);
}
function initWatch(vm){
    let watch = vm.$options.watch
    for(let key in watch){
        createWatcher(vm,key,watch[key])
    }
}

function initMethods(vm, methods){
    //源码在这里有一个名字的冲突的校验
    for(const key in methods){
        vm[key] = typeof methods[key] !== 'function' ? null : vm[key].call(vm)  //将函数中的this指向改为vue实例
    }
}