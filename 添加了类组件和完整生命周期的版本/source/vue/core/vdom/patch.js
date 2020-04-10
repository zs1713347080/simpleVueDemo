import { isUndef, isDef, isTrue, isPrimitive } from "../../shared/util"
import { isTextInputType } from '../../platform/web/util/element'
import VNode from "./vnode"



export const emptyNode = new VNode('', {}, [])
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']


function sameVnode(a, b){
    return (
        a.key === b.key && (
            (
                a.tag === b.tag &&
                a.isComment === b.isComment &&
                isDef(a.data) === isDef(b.data) &&
                sameInputType(a, b)
            )
            //  || (
            //     isTrue(a.isAsyncPlaceholder) &&                  //这里好像和组件相关，就先不写了
            //     a.asyncFactory === b.asyncFactory &&
            //     isUndef(b.asyncFactory.error)
            // )
        )
    )
}

function createKeyToOldIdx(children, beginIdx, endIdx){
    let i , key;
    const map = {};
    for(i = beginIdx;i<endIdx;i++){
        key  = children[i].ley
        if(isDef(key)) map[key] = i //把key和在children中的index关联起来
    }
    return map
}

function sameInputType(a, b){               //检查如果是input标签的话type属性是否一致
    if(a.tag !== 'input') return true //老节点不是input标签就跳过这个检查过程
    let i
    const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type //取到a节点的type属性
    const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type // 一样
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

export function createPatchFunction(backend){

    const cbs = {}       //组件生命周期的钩子函数容器

    const { modules,nodeOps } = backend

    for(let i = 0;i<hooks.length;i++) {
        cbs[hooks[i]] = []
        for(let j = 0;j < modules.length ;j++) {
            if(isDef(modules[j][hooks[i]])){
                cbs[hooks[i]].push(modules[j][hooks[i]])
            }
        }
    }


    
    function emptyNodeAt (elm) {
        return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function insert(parent, elm, ref){
        if(isDef(parent)){
            if(isDef(ref)){
                if(nodeOps.parentNode(ref) === parent){              //确认是同一个父亲
                    nodeOps.insertBefore(parent, elm, ref)
                }
            } else {
                nodeOps.appendChild(parent, elm)
            }
        }
    }

    function createRmCb(childElm, listeners) {                          //创造一个移除节点的回调
        function remove () {
            if(--remove.listeners === 0) {
                removeNode(childElm)
            }
        }
        remove.listeners = listeners
        return remove
    }

    function invokeDestroyHook(vnode) {                             //调用销毁的钩子
        var i, j;
        var data = vnode.data;
        if(isDef(data)) {
            if(isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode) }       //调用组件的destroy钩子
            for(i = 0; i< cbs.destroy.length ;i++) {  cbs[i](vnode) }            //调用cbs种的钩子
        }
        if(isDef(i = vnode.children)) {
            for(j = 0;j<i.length;j++) {
                invokeDestroyHook(i[j])                                         //销毁子节点
            }
        }
    }

    function removeVnodes(vnodes, startIdx, endIdx){
        for(;startIdx<=endIdx;startIdx++){
            const ch = vnodes[startIdx]
            if(isDef(ch)){
                if(isDef(ch.tag)){
                    removeAndInvokeRemoveHook(ch)            //移除节点
                    invokeDestroyHook(ch)                 //调用销毁钩子
                } else {    //文本节点
                    removeNode(ch.elm)
                }
            }
        }
    }

    function removeAndInvokeRemoveHook(vnode, rm){          //移除节点并调用移除的钩子
        if(isDef(rm) || isDef(vnode.data)){
            var i ;
            var listeners = cbs.remove.length + 1;
            if(isDef(rm)) {
                //多了一个回调，增加计数
                rm.listeners += listeners;
            } else {
                rm = createRmCb(vnode.elm, listeners)       //没有传入移除节点的回调就创建一个
            }
            for(let i = 0;i < cbs.remove.length;i++){
                cbs.remove[i](vnode,rm)
            }
            if(isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                i(vnode, rm)
            } else {
                rm()
            }
        } else {
            removeNode(vnode.elm)
        }
    }

    function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue){
        for(;startIdx<=endIdx;startIdx++){
            createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx)
        }
    }

    function removeNode(el){
        const parent = nodeOps.parentNode(el)
        if(isDef(parent)){
            nodeOps.removeChild(parent, el)
        }
    }

    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm){        //检查是否为组件标签
        let i = vnode.data;
        if (isDef(i)){
            const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
            if(isDef(i = i.hook) && isDef(i = i.init )){                         //调用对应组件的init钩子函数
                i(vnode, false)
            }
            //生成dom后
            if(isDef(vnode.componentInstance)){    
                initComponent(vnode, insertedVnodeQueue)             //组件生命周期相关的
                insert(parentElm, vnode.elm, refElm);       //插入节点
                return true
            }
        }
    }

    function initComponent(vnode, insertedVnodeQueue){
        // if(isDef(vnode.data.pendingInsert)) {                    //目前用不上
        //     insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
        //     vnode.data.pendingInsert = null;
        // }
        vnode.elm = vnode.componentInstance.$el         //获得解析模板后生成的dom根节点
        if(isPatchable(vnode)){                     //看一看组件有没有模板内容
            invokeCreateHooks(vnode, insertedVnodeQueue)         //调用create钩子
        } else {
            //空的组件节点
            insertedVnodeQueue.push(vnode)
        }
    }
    function invokeCreateHooks(vnode, insertedVnodeQueue){
        for(let i = 0 ;i < cbs.create.length;i++) {
            cbs.create[i](emptyNode, vnode)                     //调用钩子，目前没写相关代码
        }
        let i = vnode.data.hook     //组件的周期钩子
        if(isDef(i)) {
            if(isDef(i.create)) i.create(emptyNode, vnode)
            if(isDef(i.insert)) insertedVnodeQueue.push(vnode)
        }
    }
    function isPatchable (vnode) {
        while(vnode.componentInstance){
            vnode = vnode.componentInstance._vnode
        }
        let a = isDef(vnode.tag)
        return a
    }

    function createElm(
        vnode,
        insertedVnodeQueue,
        parentElm,
        refElm,
        nested,
        ownerArray,                     //如果是往一个vnode列表中插入的话，这个值就是那个数组列表
        index
    ){
        
    if (isDef(vnode.elm) && isDef(ownerArray)) {            //不懂     ♥♥♥♥♥♥♥♥♥
        vnode = ownerArray[index] = cloneVNode(vnode)
      }

    if(createComponent(vnode, insertedVnodeQueue, parentElm, refElm)){          //检查是否为一个组件
        return 
    }

    const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag

    if(isDef(tag)){                             //有tag说明是普通节点或者组件

        // vnode.elm = vnode.ns
        //     ? nodeOps.createElementNS(vnode.ns, tag)            //有ns就生成具有命名空间的节点       不考虑
        //     : nodeOps.createElement(tag, vnode)
        vnode.elm = nodeOps.createElement(tag,vnode)

        //源码这里有一个分支是判断在weex平台还是web平台
        if(false){

        } else {
            createChildren(vnode, children, insertedVnodeQueue)
            if(isDef(data)){
                // invokeCreateHooks(vnode, insertedVnodeQueue)     //不知道是啥玩意，先跳过
            }
            insert(parentElm, vnode.elm, refElm)
        }
    } else if (isTrue(vnode.isComment)) {       //注释节点
        vnode.elm = nodeOps.createComment(vnode.text)
        insert(parentElm, vnode.elm, refElm)
    }else {
        vnode.elm = nodeOps.createTextNode(vnode.text)
        insert(parentElm, vnode.elm, refElm)
    }
    }

    function invokeInsertHook ( vnode, queue, initial) {
        //延迟insert钩子，当组件的根节点真的被挂载之后再调用
        if(isTrue(initial) && isDef(vnode.parent)) {
            vnode.parent.data.pendingInsert = queue;
        } else {
            for (var i = 0; i < queue.length; ++i) {
              queue[i].data.hook.insert(queue[i]);              //调用钩子
            }
        }
    }
    function createChildren(vnode, children, insertedVnodeQueue){
        if(Array.isArray(children)){                                    //如果children是数组，循环创建所有子节点并指定父节点
            for(let i = 0; i<children.length ;i++){
                createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)      //
            }
        } else if (isPrimitive(vnode.text)){            //文本是普通类型
            nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))          //创建文本节点插入当前节点下
        }
    }

    function patchVnode(
        oldVnode,
        vnode,
        insertedVnodeQueue,
        ownerArray,
        index,
        removeOnly
    ) {
        if(oldVnode === vnode) {
            return 
        }

        if(isDef(vnode.elm) && isDef(ownerArray)){                      //不太明白
            vnode = ownerArray[index] = cloneVNode(vnode)
        }

        const elm = vnode.elm = oldVnode.elm        //新节点的elm指向老节点的elm

        if(isTrue(vnode.isStatic) &&                //对于预先标记好的静态节点，不必再次生成dom
            isTrue(oldVnode.isStatic) &&
            vnode.key === oldVnode.key &&
            (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
        ){
            vnode.componentInstance = oldVnode.componentInstance
            return 
        }

        let i
        const data = vnode.data
        // if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {          //预先patch
        //   i(oldVnode, vnode)
        // }

        const oldCh = oldVnode.children
        const ch = vnode.children
        // if (isDef(data) && isPatchable(vnode)) {                                       
        //   for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
        //   if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
        // }

        if(isUndef(vnode.text)){               
            if(isDef(oldCh) && isDef(ch)){
                if(oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
            } else if (isDef(ch)){
                if(isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
            } else if (isDef(oldCh)){
                removeVnodes(oldCh, 0, oldCh.length - 1)
            } else if (isDef(oldVnode.text)){
                nodeOps.setTextContent(elm, '')
            }
        } else if(oldVnode.text !== vnode.text) {
            nodeOps.setTextContent(elm, vnode.text)
        }
        // if (isDef(data)) {
        //   if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
        // }
    }

    
    function findIdxInOld (node, oldCh, start, end) {
        for (let i = start; i < end; i++) {
        const c = oldCh[i]
        if (isDef(c) && sameVnode(node, c)) return i
        }
    }

    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly){
        let oldStartIdx = 0;
        let oldEndIdx = oldCh.length -1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx]
        let newStartIdx = 0;
        let newEndIdx = newCh.length -1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx]
        let oldKeyToIdx, idxInOld, vnodeToMove, refElm

        const canMove = !removeOnly

        while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if(isUndef(oldStartVnode)){
                oldStartIdx++
                oldStartVnode = oldCh[oldStartIdx]
            } else if (isUndef(oldEndVnode)){
                oldEndIdx--
                oldEndVnode = oldCh[oldEndIdx]
            } else if (sameVnode(oldStartVnode, newStartVnode)){
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
                oldStartVnode = oldCh[++oldStartIdx]
                newStartVnode = newCh[++newStartIdx]
            } else if (sameVnode(oldEndVnode, newEndVnode)){
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
                oldEndVnode = oldCh[--oldEndIdx]
                newEndVnode = newCh[--newEndIdx]
            } else if (sameVnode(oldStartVnode, newEndVnode)){
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndVnode)
                canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm,nodeOps.nextSibling(oldEndVnode.elm))                  //把开头的老节点挪到最后面
                oldStartVnode = oldCh[++oldStartIdx]
                newStartVnode = newCh[--newEndVnode]
            } else if (sameVnode(oldEndVnode, newStartVnode)){
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
                canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
                oldStartVnode = oldCh[--oldStartIdx]
                newStartVnode = newCh[++newStartIdx]
            } else {
                //把老节点的剩下的，没和新节点匹配的节点的key和index用map存储，这样在下面搜索的时候更省时间
                if(isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
                idxInOld = isDef(newStartVnode.key)
                    ? oldKeyToIdx[newStartVnode.key]        //通过index和key的映射找到和新节点key一样的老节点
                    : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)    //通过循环寻找
                if(isUndef(idxInOld)){  //在老节点没有找到一样的节点，说明是新的节点
                    //创建新的节点并插入到正确的位置
                    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
                } else {        //找到一样的节点，是旧节点
                    vnodeToMove = oldCh[idxInOld]  //获得旧vnode的引用
                    if(sameVnode(vnodeToMove, newStartVnode)) {     //相同节点，做patch操作
                        patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
                        oldCh[idxInOld] = undefined  //将旧vnode的位置置为undefined
                        canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm) //将对应的dom位置也更新
                    } else {
                        //虽然是一样的key，但是不是sameVnode，无法复用，当作新节点来对待
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
                    }
                }
                newStartVnode = newCh[++newStartIdx]        //这一步都是操作的newStartVnode，所以将新节点列表的指针相前一步
            }
        }
        //最后进行收尾工作
        if (oldStartIdx > oldEndIdx){  //说明oldnode已经被过了一遍了，没有需要抛掉的节点，这时候看有没有新节点要加进来
            refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
            addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)     //这里没明白 ♥♥♥♥♥♥♥♥♥♥♥♥♥♥
        } else if (newStartIdx > newEndIdx) {
            removeVnodes(oldCh, oldStartIdx, oldEndIdx)
        }
    }

    return function patch (oldVnode, vnode, hydrating, removeOnly){
        if(isUndef(vnode)){
            if (isDef(oldVnode)) invokeDestroyHook(oldVnode)                //新节点是空的就直接执行销毁钩子
            return
        }

        let isInitialPatch = false //标明是否是在mount的时候调用
        const insertedVnodeQueue = []
        if(isUndef(oldVnode)){
            //空的挂载点, 创建一个新的根节点, 比如说一个组件
            isInitialPatch = true;
            createElm(vnode, insertedVnodeQueue)
        } else {
            const isRealElement = isDef(oldVnode.nodeType)

            if(!isRealElement && sameVnode(oldVnode, vnode)){
                //新旧节点都是虚拟节点
                patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
            } else {
                if(isRealElement){
                    //服务器渲染相关的逻辑？

                    oldVnode = emptyNodeAt(oldVnode)
                }
                const oldElm = oldVnode.elm;
                const parentElm = nodeOps.parentNode(oldElm)    //获得parentnode

                //创建新的节点
                createElm(
                    vnode,
                    insertedVnodeQueue,
                    oldElm._leaveCb? null : parentElm,
                    nodeOps.nextSibling(oldElm)
                )



                if(isDef(vnode.parent)){

                }

                //销毁老节点
                if(isDef(parentElm)) {
                    removeVnodes([oldVnode], 0, 0)
                } else if (isDef(oldVnode.tag)){
                    // invokeDestroyHook(oldVnode)          //先不考虑这种情况
                }

            }
        }
        invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
        return vnode.elm
    }
}
