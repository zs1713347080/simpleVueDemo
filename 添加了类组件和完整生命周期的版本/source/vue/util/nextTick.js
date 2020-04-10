let callbacks = [];
function flushCallbacks(){
    callbacks.forEach(cb=>cb())
    callbacks = []
}
export function nextTick(cb){
    callbacks.push(cb)
    let asyncFn = () =>{
        flushCallbacks();
    }

    if(Promise){
        return Promise.resolve().then(asyncFn)
    }
    if(MutationObserver){
        let observe = new MutationObserver(asyncFn);
        let textNode = document.createTextNode(1);
        observe.observe(textNode);
        textNode.textContent = 2;
        return 
    }
    if(setImmediate){
        return setImmediate(asyncFn)
    }
    setTimeout(asyncFn,0)
}