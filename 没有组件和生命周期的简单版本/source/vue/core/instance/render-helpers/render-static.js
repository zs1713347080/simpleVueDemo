export function renderStatic(index, isInFor){
    const cached = this._staticTrees || (this._staticTrees = [])

    let tree = cached[index];

    if(tree && !isInFor){           //如果已经有了静态树并且不在v-for中
        return tree
    }
    //生成新的静态树
    tree = cached = this.$options.staticRenderFns[index].call(
        this._renderProxy,
        null,
        this   
    )
    markStatic(tree, `__static__${index}`, false)
    return tree
}

export function markOnce(tree, index, key){
    markStatic(tree, `__once__${index}${key?`_${key}`:''}`,true)
    return tree
}

function markStatic(tree, key, isOnce){
    if(Array.isArray(tree)){
        for(let i = 0;i<tree.length;i++){
            if(tree[i] && typeof tree[i] !=='string'){
                markStaticNode(tree[i], `${key}_${i}`, isOnce)
            }
        }
    }else {
        markStaticNode(tree, key, isOnce)
    }
}

function markStaticNode(node,key,isOnce){
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce
}