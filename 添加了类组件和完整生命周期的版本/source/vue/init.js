import { initLifecycle, callHook } from "./lifecycle";
import { initRender } from "./render";
import { initState } from "./observe/index";
import { mergeOptions } from "./core/util/options";
import { extend } from "./shared/util";


let uid = 0
export function initMixin(Vue){
    Vue.prototype._init = function (options){
        //初始化
        let vm = this;
        vm.$options = options;
        vm.uid = uid++;
        
        // a flag to avoid this being observed
        if(options && options._isComponent){
            initInternalComponent(vm, options);     //组件初始化options
        } else {
            vm.$options = mergeOptions(             //合并options
                resolveConstructorOptions(vm.constructor),       //解析所有父节点的options的对象
                options || {},
                vm
            )
        }
        vm._isVue = true

        vm._self = vm;
        
        initLifecycle(vm)               //初始化生命周期的一些状态
        // initEvents(vm)               //事件部分逻辑先忽略
        initRender(vm)      
        
        callHook(vm,'beforeCreate')             //生命周期钩子函数
        initState(vm)

        callHook(vm, 'created')                 //生命周期钩子函数
        if(vm.$options && vm.$options.el){ //有挂载点的话调用mounted
            vm.$mount(vm.$options.el);
        }   
    }
}



export function resolveConstructorOptions (Ctor) { 
    let options = Ctor.options
    if (Ctor.super) {
      const superOptions = resolveConstructorOptions(Ctor.super)       //递归将构造函数链上所有的options全部收集回来返回
      const cachedSuperOptions = Ctor.superOptions
      if (superOptions !== cachedSuperOptions) {
        // 父亲的 options发生了变化，需要重新解析一个新的options
        Ctor.superOptions = superOptions

        const modifiedOptions = resolveModifiedOptions(Ctor)                //解析修改的部分
        if (modifiedOptions) {
          extend(Ctor.extendOptions, modifiedOptions)       //把修改的部分合并到构造函数上
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions) //得到最终的options
        if (options.name) {
          options.components[options.name] = Ctor       //更新构造器的缓存
        }
      }
    }
    return options
  }


  function resolveModifiedOptions (Ctor) {      //解析被修改的部分返回
    var modified;
    var latest = Ctor.options;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = latest[key];
      }
    }
    return modified
  }

  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);     //获得构造函数上的options，每个组件都不同的
    // 存储节点指针是为了节省在原型链上查询的时间
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;        //获得一些其他属性
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {                                           //如果已经有render函数了就直接继承现有的构造函数
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }