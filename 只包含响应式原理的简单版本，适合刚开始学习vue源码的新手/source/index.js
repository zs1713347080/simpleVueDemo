import { initState } from "./observe";
import { compiler } from "./compiler";
import { Watcher } from "./observe/watcher";

export default function Vue(options){
    this._init(options)                 //对用户传过来的内容直接调用_init进行初始化
}

Vue.prototype._init = function (options) {

    //获得当前实例
    let vm = this;
    vm.$options = options;      //将用户传递过来的对象放到$options上方便取用

    initState(vm)   //初始化数据，对data进行响应式定义，计算属性和watch的初始化，是响应式核心的入口

    if(vm.$options.el) {
        vm.$mount()
    }
}

Vue.prototype._update = function () {               //模拟对dom的更新，源码中，diff算法是从这里进入的
    let vm = this;
    let el = vm.$el;

    let node = document.createDocumentFragment();           //创建文档碎片
    let firstChild = el.firstChild
    while(firstChild = el.firstChild) {
        node.appendChild(firstChild)            //把之前的dom放入文档碎片中
    }
    compiler(node, this)            //模拟模板编译

    el.appendChild(node)        //将处理好的文档碎片再放回来
}


Vue.prototype.$mount = function () {
    console.log('mount')
    let vm = this;
    let el = vm.$options.el;
    el = vm.$el = query(el);                //获得挂载点


    let updateComponent = () => {               //模拟更新
        vm._update();
    }
    new Watcher(vm, updateComponent, undefined, undefined, true)        //创建渲染watcher
}



export function query(el){
    if(typeof el === 'string'){
        return document.querySelector(el);
    }
    return el; 
}