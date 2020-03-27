import { createEmptyVNode } from "./core/vdom/vnode";
import { Watcher } from "./observe/watcher";


export function initLifecycle(vm){
    const options = vm.$options

    //locate first non-abstract parent//找到最近的一个抽象父级
    let parent = options.parent;
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
        console.log('最新的vnode',vnode,hydrating)

        const vm = this;
        const preEl = vm.$el                        //旧的 DOM 根节点
        const preVnode = vm._vnode                  //旧的virtual DOM 根节点
        // const restoreActiveInstance = setActiveInstance(vm) //暂时不明白干嘛用的

        vm._vnode = vnode //将新的vnode记录到实例上
        //使用原型上的__patch__方法，该方法在初始化
        if(!preVnode){
            //第一次渲染
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false)
        } else {
            vm.$el = vm.__patch__(preVnode, vnode)
        }
    }
    Vue.prototype.$forceUpdate = function() {

    }
    Vue.prototype.$destroy = function () {

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
            if(vm._isMounted &&!vm._isDestroyed){

            }
    }}, true)       //创建渲染watcher

    hydrating = false;

    
  if (vm.$vnode == null) {
    vm._isMounted = true            //mounted完成
    callHook(vm, 'mounted')         //调用钩子函数
  }

  return vm                         //组件化的时候使用
}


export function callHook (vm, hook) {

}
