export function optimize(root,options){
    if(!root)return //空节点直接返回
    
  // first pass: 标记非静态节点
  markStatic(root)
  // second pass: 标记静态节点
  markStaticRoots(root, false)
}

function markStatic(node){
    node.static = isStatic(node)
    if (node.type === 1){

        for(let i = 0,l = node.children.length;i<l;i++){
            const child = node.children[i];
            markStatic(child)
            if(!child.static) {
                node.static = false         //如果子节点中有非静态节点，那么父节点也就不再被认为是静态节点了
            }
        }
        if(node.ifConditions) {
            for(let i = 1,l = node.ifConditions.length;i<l;i++){
                const block = node.ifConditions[i].block;
                markStatic(block)
                if(!block.static){         //如果子节点中有非静态节点，那么父节点也就不再被认为是静态节点了
                    node.static = false
                }
            }
        }
    }
}
function markStaticRoots(node,isInFor){
    if(node.type === 1){
        if (node.static && node.children.length && !(           //将本身是静态节点并且子节点大于1的左子节点非文本节点的节点视为staticRoot节点
            node.children.length === 1 &&
            node.children[0].type === 3
          )) {
            node.staticRoot = true
            return
          } else {
            node.staticRoot = false
          }
          if (node.children) {
            for (let i = 0, l = node.children.length; i < l; i++) {
              markStaticRoots(node.children[i], isInFor || !!node.for)
            }
          }
          if (node.ifConditions) {
            for (let i = 1, l = node.ifConditions.length; i < l; i++) {
              markStaticRoots(node.ifConditions[i].block, isInFor)
            }
          }
    }
}

function isStatic(node){            //用于判断某个节点是不是静态节点
    if(node.type === 2){            //表达式
        return false
    }

    if(node.type === 3){            //文本
        return true
    }
    return !!(node.pre || ( //如果有pre标记的话就认为是静态节点
        // !node.hasBindings &&
        !node.if && !node.for 
    ))
}