import { createEmptyVNode } from "./core/vdom/vnode";
import { Watcher } from "./observe/watcher";
import { pushTarget, popTarget } from "./observe/dep";
import { remove } from "./shared/util";


export let activeInstance = null


export function setActiveInstance(vm) {                 //切换activeinstance，以闭包的形式保留老实例
    const prevActiveInstance = activeInstance
    activeInstance = vm
    return () => {
      activeInstance = prevActiveInstance
    }
}

export function initLifecycle(vm){                      //初始化生命周期状态
    const options = vm.$options
    //locate first non-abstract parent//找到最近的一个抽象父级
    let parent = options ? options.parent : null;
    if(parent && !options.abstract){
        while(parent.$options.abstract && parent.$parent) {
            parent = parent.$parent
        }
        parent.$children.push(vm)
    }

    vm.$parent = parent
    vm.$root = parent ? parent.$root : vm;
    
    vm.$children = [];
    vm.$refs = {}


    //生命周期状态
    vm.watcher = null;
    vm._inactive = null;
    vm._directInactive = false
    vm._isMounted = false;
    vm.isDestoryed = false;
    vm._isBeingDestoryed = false
}

export function lifecycleMixin(Vue){        //混入生命周期方法
    Vue.prototype._update = function(vnode, hydrating){

        const vm = this;
        const preEl = vm.$el                        //旧的 DOM 根节点
        const preVnode = vm._vnode                  //旧的virtual DOM 根节点
        const restoreActiveInstance = setActiveInstance(vm) //切换新的实例节点，并储存之前实例节点 

        vm._vnode = vnode //将新的vnode记录到实例上
        //使用原型上的__patch__方法，该方法在初始化
        if(!preVnode){
            //第一次渲染
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false)
        } else {
            vm.$el = vm.__patch__(preVnode, vnode)
        }
        restoreActiveInstance()             //将之前的实例节点再调整回来
        if(vm.$el) {
            vm.$el.__vue__ = vm
        }
    }
    Vue.prototype.$forceUpdate = function() {

    }
    Vue.prototype.$destroy = function () {
        console.log('调用销毁钩子',this)
        const vm = this         //获得调用destroy钩子的实例
        if(vm._isBeingDestoryed){               //防止运行时二次销毁
            return 
        }
        vm._isBeingDestoryed = true
        const parent = vm.$parent   //获得父亲的实例引用
        console.log(parent)
        if(parent && !parent._isBeingDestoryed && !vm.$options.abstract) {          //从父亲的引用中移除
            remove(parent.$children, vm)
        }

        //停用渲染watcher
        if (vm._watcher) {
            vm._watcher.teardown()
        }
        let i = vm._watchers.length
        while(i--){                     //其他类型的watcher也进行停用
            vm._watchers[i].teardown()
        }

        // if(vm._data.__ob__) {                    //暂时用不上
        //     vm._data.__ob__.vmCount--;
        // }

        vm._isDestroyed = true;

        //调用当前呈现树上的销毁钩子
        vm.__patch__(vm._vnode, null);;
        console.log(vm)

        //移除__vue__引用
        if (vm.$el) {
          vm.$el.__vue__ = null;
        }

        callHook(vm, 'destroyed');  //激活destroyed钩子

        // vm.$off();      //暂时用不到

        //消除循环引用
        if (vm.$vnode) {
            vm.$vnode.parent = null;
        }
    }
}

export function mountComponent(vm, el, hydrating){
    vm.$el = el;
    if(!vm.$options.render){
        vm.$options.render = createEmptyVNode           //如果没有render函数就造个空节点 
        //源码在这边会打印一些错误信息
    }

    callHook(vm, 'beforeMount')                           //调用生命周期钩子函数

    let updateComponent
    if(false){          //这里是判断非生产环境然后执行很多标记，好像是为了测试效率?

    }else {
        updateComponent = () => {                               //定义updateComponent方法
            vm._update(vm._render(), hydrating)
        }
    }

    new Watcher(vm, updateComponent, null, {
        before () {
            if(vm._isMounted &&!vm._isDestroyed){               //实例挂载并且没被销毁
                callHook(vm, 'beforeUpdate');            //调用钩子
            }
    }}, true)       //创建渲染watcher

    hydrating = false;

    
  if (vm.$vnode == null) {
    vm._isMounted = true            //mounted完成       组件的钩子函数在创建组件的过程中调用了
    callHook(vm, 'mounted')         //调用钩子函数
  }

  return vm                         //组件化的时候使用
}


export function callHook (vm, hook) {
    pushTarget()            //把依赖栈顶置空，防止依赖被错误地收集
    const handlers = vm.$options[hook]
    if(handlers){
        for(let i = 0;i<handlers.length;i++) {
            let args = handlers[i]
            args.call(vm)
        }
    }
    popTarget()             //清空栈开头的空节点
}
