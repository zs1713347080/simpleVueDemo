

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
        console.log(vnode, hydrating)
    }
    Vue.prototype.$forceUpdate = function() {

    }
    Vue.prototype.$destroy = function () {

    }
}

export function mountComponent(vm, el, hydrating){
    vm.$el = el;
    if(!vm.$options.render){

    }
    callHook(vm, 'beforeMount')

    let updateComponent
    if(false){          //这里是判断非生产环境

    }else {
        updateComponent = () => {
            vm._update(vm._render(), hydrating)
        }
    }
}


export function callHook (vm, hook) {

}
