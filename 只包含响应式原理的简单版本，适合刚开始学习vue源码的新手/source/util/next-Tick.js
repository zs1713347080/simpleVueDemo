let callbacks = []                      //需要在nextTick执行的回调
let pending = false                     //是否正在pending中
let timerFunc
function flushCallbacks(){              //清空回调函数队列的函数
    pending = false
    callbacks.forEach(cb=>cb());
    callbacks = []
}
export function nextTick(cb) {
    callbacks.push(cb)                  //把回调放入回调队列中
    if(!pending) {                      //如果不是pending状态就开启一个微任务
        pending = true
        timerFunc()
    }
}
if(Promise) {                                           //先进行浏览器能力判断，决定使用哪一种异步
    timerFunc = () => { 
        Promise.resolve().then(flushCallbacks)
    }
} else if (MutationObserver) {
    let observe = new MutationObserver(flushCallbacks);
    let textNode = document.createTextNode(1);
    observe.observe(textNode,{characterData:true});
    timerFunc = () => {
        textNode.textContent = 2;
    }
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks);
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks, 0)
    }
}
