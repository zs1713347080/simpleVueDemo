

export default class VNode {
    constructor(
        tag,                //节点名称
        data,               //节点的属性
        children,           //子节点
        text,               //文本
        elm,                //vnode
        context,            //Component
        componentOptions,   //VNodeComponentOptions
        asyncFactory        //函数？
        ){
            this.tag = tag;
            this.data = data;
            this.children = children;
            this.text = text;
            this.elm = elm;
            this.context = context;
            this.key = data && data.key;
            this.componentOptions = componentOptions;
            this.asyncFactory = asyncFactory
            this.isStatic = false                       //是否静态节点
            this.isComment = false                      //不知是表示干啥的
            this.isCloned = false                       //是否克隆的节点
            this.isOnce = false                         //是否单次渲染节点
            this.parent = undefined                     //父节点
    }
}

export const createEmptyVNode = text => {
    const node = new VNode();
    node.text = text;
    node.isComment = true
    return node;
}

export function createTextVNode(val){
    return new VNode(undefined, undefined, undefined, String(val))
}

export function cloneVNode(vnode){
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        //为了防止修改了原子节点，只好把子节点也克隆
        vnode.children && vnode.children.slice(),
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
        vnode.asyncFactory
    )
    //克隆其余属性
    cloned.ns = vnode.ns
    cloned.isStatic = vnode.isStatic
    cloned.key = vnode.key
    cloned.isComment = vnode.isComment
    // cloned.fnContext = vnode.fnContext
    // cloned.fnOptions = vnode.fnOptions       //暂时不明白这些属性的用处就先不加了
    // cloned.fnScopeId = vnode.fnScopeId
    // cloned.asyncMeta = vnode.asyncMeta
    cloned.isCloned = true
    return cloned
}