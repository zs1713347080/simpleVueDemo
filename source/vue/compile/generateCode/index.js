import { isReservedTag } from '../../platform/web/util/element'

function ifTrue(param){
    return param?true:false
}

export function generate(ast,options){
    const state = new CodegenState(options)
    const code = ast ? genElement(ast, state) : '_c("div")'

    return {
        render: `with(this){return ${code}}`,
        staticRenderFns: state.staticRenderFns
    }
}

export class CodegenState{
    constructor(options){
        this.staticRenderFns = []
    }
}

export function genElement (el, state){
    if(el.parent){
        el.pre = el.pre || el.parent.pre
    }

    if(el.staticRoot && !el.staticProcessed){                       //是静态节点并且未被生成过                   
        return genStatic(el, state)
    } else if (el.once && !el.onceProcessed){
        return genOnce(el, state)
    } else if (el.for && !el.forProcessed){
        return genFor(el,state)
    } else if (el.if && !el.ifProcessed) {
        return genIf(el, state)
    } else if (el.tag === 'template' && !state.pre){
        return genChildren(el, state) || 'void 0'
    } else {
        //组件或者普通节点
        let code;
        if(el.component){
            code = genComponent(el.component, el, state)
        } else {
            let data
            if(!el.plain || (el.pre && maybeComponent(el))){
                data = genData(el,state)
            }

            const children = el.inlineTemplate ? null : genChildren(el,state,true)
            code = `_c('${el.tag}'${
                data?`,${data}` : ''
            }${
                children ? `,${children}` : ''
            })`
        }
        return code

    }
}

function genStatic(el, state){
    if(el.pre){
        state.pre = el.pre
    }
    state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)

    return `_m(${
        state.staticRenderFns.length - 1
    }${
        el.staticInFor ? ',true' :''
    })`
}

function genOnce (el, state){
    el.onceProcessed = true
    if(el.if && el.ifProcessed){
        return genIf(el,state)
    } else if (el.staticInFOr){             //处于v-for循环中的static节点
        let key = ''
        let parent = el.parent;
        while(parent){
            if(parent.for){
                key = parent.key
                break;
            }
            parent = parent.parent
        }
        if(!key){
            //源码这里会提示v-once必须在v-for中使用
            return genElement(el, state)            //执行这个函数就相当于让v-once无效了
        }
    } else {
        return genStatic(el, state)
    }
}

export function genFor(el,state,altGen,altHelper){
    const exp = el.for;
    const alias = el.alias;
    const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
    const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

    el.forProcessed = true; // avoid recursion
    return (altHelper || '_l') + "((" + exp + ")," +
      "function(" + alias + iterator1 + iterator2 + "){" +
        "return " + ((altGen || genElement)(el, state)) +
      '})'
}

function maybeComponent(el){         //判断这个节点是不是组件节点
    return !!el.component || !isReservedTag(el.tag)
}

export function genIf(el,state,altGen,altEmpty){
    el.ifProcessed = true;
    return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions(conditions, state, altGen, altEmpty){                                                  //这一段是完全没看懂♥♥♥♥♥♥♥♥♥♥♥♥
    if(!conditions.length){
        return altEmpty || `_e()`           //没有if判定条件
    }   
    const condition = conditions.shift();
    console.log(condition.exp,'---------------')
    if(condition.exp) {
        return `(${ifTrue(condition.exp)})?${
            genTernaryExp(condition.block)
        }:${
            genIfConditions(conditions, state, altGen, altEmpty)
        }`
    } else {
        return `${genTernaryExp(condition.block)}`
    }


    function genTernaryExp (el) {
        return altGen
          ? altGen(el, state)
          : el.once
            ? genOnce(el, state)
            : genElement(el, state)
      }
}

export function genChildren (el,state,checkSkip,altGenElement,altGenNode){                          //整体逻辑没明白  ♥♥♥♥♥♥♥♥♥♥
    const children = el.children;
    if(children.length) {               //如果有子节点 
        const el = children[0];
        //优化v-for子节点只有一个的情况
        if(children.length === 1 && el.for && el.tag !== 'template'){
            const normalizationType = checkSkip 
                ? maybeComponent(el) ? `,1` : `,0`      //如果是组件就传入1 不是就传入0
                : ``
            return `${(altGenElement || genElement)}`
        }

        const normalizationType = checkSkip
            ? getNormalizationType(children, maybeComponent)
            : 0
        const gen = altGenNode || genNode
        return `[${children.map(c => gen(c, state)).join(',')}]${
            normalizationType ? `,${normalizationType}`: ``
        }`
    }
}

//0代表不需要标准化
//1代表需要一般标准化（可能是一层嵌套数组）
//2代表需要完全标准化
function getNormalizationType (children, maybeComponent){
    let res = 0

    for(let i = 0;i<children.length; i++){
        const el = children[i]
        if(el.type!==1){                    //跳过类型不是1的节点
            continue
        }
        if(needsNormalization(el) || (el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))){            //子节点有for 的或者template 或者slot 或者 v-if的
            res = 2
            break
        }
        if(maybeComponent(el) || (el.ifConditions && el.ifConditions.some(c => maybeComponent(c.block)))){                      //子节点有是组件的
            res = 1
        }
    }
    return res
}


function needsNormalization (el) {
    return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
  }

  function genNode (node, state) {
    if (node.type === 1) {
      return genElement(node, state)
    } else if (node.type === 3 && node.isComment) {
      return genComment(node)
    } else {
      return genText(node)
    }
  }


  export function genText (text) {                          //搞文本节点
    return `_v(${text.type === 2            //2代表expression也就是有双括号表达式的
      ? text.expression // no need for () because already wrapped in _s()
      : transformSpecialNewlines(JSON.stringify(text.text))
    })`
  }


  export function genComment (comment) {                //搞注释节点
    return `_e(${JSON.stringify(comment.text)})`
  }

  function transformSpecialNewlines (text) {            //字符的转换
    return text
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  }

  function genComponent(componentName,el,state){                                    //完全不懂
    const children = el.inlineTemplate ? null : genChildren(el, state, true)
    return `_c(${componentName},${genData(el, state)}${
        children ? `,${children}` : ``
    })`
  }
  function genData(el,state){
    let data = '{'
    //key
    if(el.key){
        data += `key:${el.key},`
    }
    //pre
    if(el.pre){
        data += `pre:true,`
    }
    //record original tag name for components using "is" attribute
    if(el.component){
        data += `tag:${el.tag},`
    }

    // if(el.attrs){
    //      data += `attrs:${genProps}`
    // }
    
    
  // component v-model
//   if (el.model) {
//     data += `model:{value:${
//       el.model.value
//     },callback:${
//       el.model.callback
//     },expression:${
//       el.model.expression
//     }},`
//   }


  // inline-template
//   if (el.inlineTemplate) {
//     const inlineTemplate = genInlineTemplate(el, state)
//     if (inlineTemplate) {
//       data += `${inlineTemplate},`
//     }
//   }
  data = data.replace(/,$/, '') + '}'
   return data
}