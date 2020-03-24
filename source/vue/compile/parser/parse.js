import {parseHTML} from './html-parser'

import { platformGetTagNamespace } from '../../platform/web/util/element';
import { getAndRemoveAttr, getBindingAttr } from '../helper';

import { extend } from '../../shared/util'
import { parseText } from './text-parser';

//正则部分

export const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/          //用于匹配 v-for        匹配空格（捕获匹配前面的变量用的是*）匹配最少一个空格 非捕获匹配 in 或者 of 匹配最少一个空格 (捕获匹配前面的变量用的是*)
const stripParensRE = /^\(|\)$/g                                    //用于匹配 v-for 解析的时候去掉括号
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/       //用于解析v-for去掉括号后的字符串，将临时变量解析出来


//正则部分


const blackLineBreak = /^(\n|\s)+/                                      //匹配字符开头的换行符和空格
const whitespaceRE = /\s+/g                                     //匹配多个空格
export const bindRE = /^:|^\.|^v-bind:/                         //匹配动态属性


export const outputSourceRange =  process.env.NODE_ENV !== 'production'                 //原本是在参数定义的,为了让看起来更简单一点

export const dirRE = /^v-|^@|^:|^\.|^#/                         //匹配动态u属性

const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g
const dynamicArgRE = /^\[.*\]$/





export function createASTElement(tag,attrs,parent){
    return {
        type: 1,
        tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        rawAttrsMap: {},
        parent,
        children: []  
    }
}
function makeAttrsMap(attrs){       //将节点的属性列表改成map数据结构
    const map = {}
    for(let i = 0, l = attrs.length;i<l;i++){
        //检测环境
        map[attrs[i].name] = attrs[i].value
    }
    return map
}

export function parse(template,options){
    let root              //用于储存ast的根节点
    let currentParent; // 用于储存最近的节点的parent
    let inVPre = false
    let inPre = false
    const stack = []            //用于记录ast语法树的栈
    //前面先进行配置这一块
    
    function closeElement(element){
        trimEndingWhitespace(element)
        if(!inVPre && !element.processed){      //不是预处理节点并且并未被解析
            element = processElement(element,options)
        }

        //树节点的管理
        if(!stack.length && element !== root){
            //这边是做了一个处理，就是根节点上的v-if必须用v-if-else代替,否则就会提示错误
        }
        if(currentParent){    //源码在这边是禁止style 和 script 标签的
            if (element.elseif || element.else) {
                processIfConditions(element, currentParent)         //搞一点if条件
              }
            currentParent.children.push(element)                //记录子节点
            element.parent = currentParent                      //记录父节点
        }
        //过滤掉带有slotScope的节点
        // element.children = element.children.filter(c => !c.slotScope)            //可有可无，暂时没有写有关插槽代码的解析

        //删除最后面的空白节点
        trimEndingWhitespace(element)

        //调整pre值
        if (element.pre) {
            inVPre = false
        }

    }
    function trimEndingWhitespace (el) {                  //删除最后面的空白节点
        // remove trailing whitespace node
        if (!inPre) {
        let lastNode
        while (
            (lastNode = el.children[el.children.length - 1]) &&
            lastNode.type === 3 &&
            lastNode.text === ' '
        ) {
            el.children.pop()
        }
        }
    }
    //调用parseHTML
    parseHTML(template,
        {
            start(tag, attrs, unary, start, end){                                   //解析开头节点

                //检查命名空间，如果有父亲的ns就继承父亲的ns
                // const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

                //源码这里有个用于兼容ie的svg 的bug的配置，省略了

                let element = createASTElement(tag, attrs, currentParent)

                // if(ns){
                //     element.ns = ns
                // }

                if(outputSourceRange){           //源码中是如果非生产环境的话执行该步操作
                    element.start = start;
                    element.end = end;
                    element.rawAttrsMap = element.attrsList.reduce((cumulated, attr)=>{                 //将节点的属性列表归并为map
                        cumulated[attr.name] = attr
                        return cumulated
                    },{})
                }


                //源码这里是一堆对template里的一些不规范写法的提示

                //源码这里还有一个对节点的预处理        暂时不知道  不打算写了                                       ♥♥♥♥♥♥♥♥♥♥

                if (!inVPre) {                          //处理标有v-pre的节点
                    processPre(element)
                    if (element.pre) {
                      inVPre = true
                    }
                }

                if(element.tag === 'pre'){              //判断是否是pre标签
                    inPre = false
                }

                if(inVPre){
                    processRawAttrs(element)            //如果是带有v-pre标签的节点
                } else if(!element.processed){           //如果还没被解析
                    processFor(element)                 //解析v-for
                    processIf(element)                  //解析v-if
                    processOnce(element)                //解析 v-once
                }

                if(!root){
                    root = element
                    //这里有一个检查模板是不是只有一个根节点的代码错误提示，就不写了,vue是不允许一个temoplate下有两个同级的div的
                }
                if(!unary){                                 //如果不是一元标签执行以下代码
                    currentParent = element // 记录当前元素作为接下来匹配元素的父元素
                    stack.push(element)         //入栈
                } else {
                    closeElement(element)       //如果是一元标签就执行这个方法
                }
            },
            end(tag, start, end){                                                   //解析结束节点

                const element = stack[stack.length - 1]
                //pop stack
                stack.length -= 1
                currentParent = stack[stack.length - 1]
                closeElement(element)
            },
            chars(text, start, end){                                                  //解析文本节点
                //源码这里有个兼容ie的，就不写了
                const children  = currentParent.children
                if(text){
                    if(!inPre){
                        text = text.replace(whitespaceRE,' ')
                    }
                    let res;
                    let child;
                    if(!inPre && text!==' ' && (res = parseText(text))){            //非v-pre节点并且文本必须具有双括号表达式
                        child = {
                            type:2,                             //2类型代表的是具有动态绑定的节点
                            expression:res.expression,
                            tokens:res.tokens,
                            text
                        }
                    } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' '){  //这是vue的原条件，没看明白，后面是我自己加的
                    // } else if ((text.replace(blackLineBreak,''))&&text){   //我自己觉得这个空格节点还是删掉合适
                        child = {
                            type :3,                                //3类型是静态文本节点
                            text
                        }
                    }
                    if(child){
                        children.push(child)
                    }
                }
            },
            comment(text, start, end){                                                  //解析注释节点，虽然写了这个函数，但是在parsehtml函数中没有调用，只是把注释节点跳过了 
                if (currentParent) {
                    const child = {
                      type: 3,
                      text,
                      isComment: true
                    }
                    currentParent.children.push(child)
                }

            }
        })
    return root
}
function processPre (el) {
    if (getAndRemoveAttr(el, 'v-pre') != null) {
      el.pre = true
    }
}

function processRawAttrs (el) {
    const list = el.attrsList       //获得节点的属性列表
    const len = list.length
    if (len) {
      const attrs = el.attrs = new Array(len)
      for (let i = 0; i < len; i++) {               //不太懂这一步是为了干什么     ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
        attrs[i] = {
          name: list[i].name,
          value: JSON.stringify(list[i].value)
        }
        if (list[i].start != null) {
          attrs[i].start = list[i].start
          attrs[i].end = list[i].end
        }
      }
    } else if (!el.pre) {               //如果是无属性节点并且没有手动标记为静态节点的话
      el.plain = true
    }
  }

  export function processFor (el) {
    let exp
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {            //获得节点的v-for内容
      const res = parseFor(exp)
      if (res) {
        extend(el, res)                                     //将解析v-for函数返回的对象属性扩展到当前节点上
      }
      //源码在这里还有一个不在生产模式的警告提示
    }
  }

  
export function parseFor (exp) {
    const inMatch = exp.match(forAliasRE)
    if (!inMatch) return
    const res = {}
    res.for = inMatch[2].trim()                                                 //节点上的for属性记录的是被循环的内容
    const alias = inMatch[1].trim().replace(stripParensRE, '')                  //alias是去掉括号后的循环时的临时变量
    const iteratorMatch = alias.match(forIteratorRE)                            //匹配临时变量是否有多个
    if (iteratorMatch) {
      res.alias = alias.replace(forIteratorRE, '').trim()                       //临时变量
      res.iterator1 = iteratorMatch[1].trim()                                   //key
      if (iteratorMatch[2]) {
        res.iterator2 = iteratorMatch[2].trim()                                 //如果有序列也就是index的话也存起来
      }
    } else {                                                                    //如果没有匹配到括号的话是不会替换的，就直接记录临时变量就可以了                                                 
      res.alias = alias
    }
    return res                                                                  //返回被解析完v-for的节点
  }

  
function processIf (el) {
    const exp = getAndRemoveAttr(el, 'v-if')
    if (exp) {
      el.if = exp
      addIfCondition(el, {
        exp: exp,
        block: el
      })
    } else {
      if (getAndRemoveAttr(el, 'v-else') != null) {
        el.else = true
      }
      const elseif = getAndRemoveAttr(el, 'v-else-if')
      if (elseif) {
        el.elseif = elseif
      }
    }
  }

  export function addIfCondition (el, condition) {
    if (!el.ifConditions) {
      el.ifConditions = []
    }
    el.ifConditions.push(condition)
  }

  function processOnce (el) {
    const once = getAndRemoveAttr(el, 'v-once')
    if (once != null) {
      el.once = true
    }
  }

  export function processElement(element,options){
      processKey(element)           //解析key属性

      element.plain = (             //如果该节点没有属性没有key没有插槽的话，就认为是个plain节点，我个人认为跟静态节点差不多，当然了其子节点当然不是静态的
        !element.key &&
        !element.scopedSlots &&
        !element.attrsList.length  
      )

        processRef(element)                         //初始化ref

        processComponent(element)

        //源码这里是适配pre

        return element
  }

  function processComponent(el){
      let binding;
      if((binding = getBindingAttr(el, 'is'))){
          el.compenent = binding
      }
      if(getAndRemoveAttr(el, 'inline-template')!==null){
          el.inLineTemplate = true
      }
  }

  function processRef (el) {
    const ref = getBindingAttr(el, 'ref')
    if (ref) {
      el.ref = ref
      el.refInFor = checkInFor(el)                //标记是否在v-for中
    }
  }
  function processIfConditions (el, parent) {
    const prev = findPrevElement(parent.children)       //找到该节点的
    if (prev && prev.if) {
      addIfCondition(prev, {
        exp: el.elseif,
        block: el
      })
    }
  }
  function findPrevElement (children) {
    let i = children.length
    while (i--) {
      if (children[i].type === 1) {
        return children[i]
      } else {
        children.pop()
      }
    }
  }

  function checkInFor (el) {                //检查是否在v-for中
    let parent = el
    while (parent) {
      if (parent.for !== undefined) {
        return true
      }
      parent = parent.parent
    }
    return false
  }
  function processKey(el){
    const exp = getBindingAttr(el,'key')    //获得key 的动态绑定属性

    if(exp){
        //这里会判断环境并且打印一些警告信息
    }

    el.key = exp
  }