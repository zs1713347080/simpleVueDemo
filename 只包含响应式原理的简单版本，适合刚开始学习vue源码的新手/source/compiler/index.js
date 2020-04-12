


const defaultRE = /\{\{((?:.|\r\n)+?)\}\}/g

function compilerText(node,vm){
    if(!node.reg){
        node.reg = node.textContent
    }
    node.textContent = node.reg.replace(defaultRE,function(...args){            //正则匹配到双括号表达式中的内容
        let func = new Function (`with(this){
            return ${args[1]}
        }`)
        return func.call(vm)                //用表达式中的内容创建一个vm作用域的函数执行得出结果，将文本中的内容替换
    })
}


export function compiler (node, vm){                //深度遍历文档节点
    let childNodes = node.childNodes;
    //将类数组转化成数组
    [...childNodes].forEach(child=>{
        if(child.nodeType == 1){//元素节点
            compiler(child,vm)
        } else if (child.nodeType == 3){//文本节点
            compilerText(child,vm)                  //如果是文本节点就处理
        }
    })
}