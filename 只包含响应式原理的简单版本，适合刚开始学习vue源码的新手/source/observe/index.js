import { observe } from "./observer";

export function initState(vm){
    let opts = vm.$options;
    //初始化data
    if(opts.data) {
        initData(vm);
    }
    //初始化计算属性                        由于计算属性可能依赖data中的数据，因此计算属性初始化必须在data初始化后面
    if(opts.computed){
        initComputed(vm,opts.computed);
    }
    //初始化侦听器                          这个也需要在data初始化之后
    if(opts.watch){
        initWatch(vm);
    }
}

function initData(vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'        //在vm实例上创建一个_data属性表示私有的data
                        ? data.call(vm)                 //如果data是个函数就执行，获得返回值作为data
                        : data || {}                    //如果不是函数就直接当作对象处理
    //将对象上的_data中的属性代理到vm实例上,这样在函数作用域绑定了vue实例之后
    //函数内部就可以使用this.来访问data中的属性了
    for(let key in data) {
        proxy(vm, '_data', key)
    }
    observe(vm._data)
}


function proxy(vm,source,key){              //代理属性的工具函数
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },
        set(newValue){
            vm[source][key] = newValue
        }
    })
}

function initComputed(vm, computed) {

}

function initWatch (vm) {

}