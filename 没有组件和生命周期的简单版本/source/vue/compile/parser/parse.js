import {parseHTML} from './html-parser'

import { getAndRemoveAttr, getBindingAttr } from '../helper';

import { extend } from '../../shared/util'
import { parseText } from './text-parser';

//正则部分

export const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/          //用于匹配 v-for        匹配空格（捕获匹配前面的变量用的是*）匹配最少一个空格 非捕获匹配 in 或者 of 匹配最少一个空格 (捕获匹配前面的变量用的是*)
const stripParensRE = /^\(|\)$/g                                    //用于匹配 v-for 解析的时候去掉括号
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/       //用于解析v-for去掉括号后的字符串，将临时变量解析出来


//正则部分


// const blackLineBreak = /^(\n|\s)+/                                      //匹配字符开头的换行符和空格
const whitespaceRE = /\s+/g                                     //匹配多个空格
export const bindRE = /^:|^\.|^v-bind:/                         //匹配动态属性


export const outputSourceRange =  process.env.NODE_ENV !== 'production'                 //原本是在参数定义的,为了让看起来更简单一点

export const dirRE = /^v-|^@|^:|^\.|^#/                         //匹配动态u属性

// const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g
// const dynamicArgRE = /^\[.*\]$/





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
    const stack = []            //用于记录ast语法树的栈
    //前面先进行配置这一块
    
    function closeElement(element){
        trimEndingWhitespace(element)

        if(currentParent){    //源码在这边是禁止style 和 script 标签的
            currentParent.children.push(element)                //记录子节点
            element.parent = currentParent                      //记录父节点
        }

        //删除最后面的空白节点
        trimEndingWhitespace(element)


    }
    function trimEndingWhitespace (el) {                  //删除最后面的空白节点
        // remove trailing whitespace node
        let lastNode
        while (
            (lastNode = el.children[el.children.length - 1]) &&
            lastNode.type === 3 &&
            lastNode.text === ' '
        ) {
            el.children.pop()
        }
    }
    //调用parseHTML
    parseHTML(template,
        {
            start(tag, attrs, unary, start, end){                                   //解析开头节点

                let element = createASTElement(tag, attrs, currentParent)

                if(outputSourceRange){           //源码中是如果非生产环境的话执行该步操作
                    element.start = start;
                    element.end = end;
                    element.rawAttrsMap = element.attrsList.reduce((cumulated, attr)=>{                 //将节点的属性列表归并为map
                        cumulated[attr.name] = attr
                        return cumulated
                    },{})
                }

                if(!element.processed){           //如果还没被解析
                    processFor(element)                 //解析v-for
                    processIf(element)                  //解析v-if
                }

                if(!root){
                    root = element
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
                    text = text.replace(whitespaceRE,' ')
                    let res;
                    let child;
                    if(text!==' ' && (res = parseText(text))){            //文本必须具有双括号表达式
                        child = {
                            type:2,                             //2类型代表的是具有动态绑定的节点
                            expression:res.expression,
                            tokens:res.tokens,
                            text
                        }
                    } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' '){
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

  export function processFor (el) {
    let exp
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {            //获得节点的v-for内容
      const res = parseFor(exp)
      if (res) {
        extend(el, res)                                     //将解析v-for函数返回的对象属性扩展到当前节点上
      }
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

  
function processIf (el) {                               //解析v-if
    const exp = getAndRemoveAttr(el, 'v-if')
    if (exp) {
      el.if = exp
      addIfCondition(el, {
        exp: exp,
        block: el
      })
    }
  }

  export function addIfCondition (el, condition) {              //添加v-if条件
    if (!el.ifConditions) {
      el.ifConditions = []
    }
    el.ifConditions.push(condition)
  }

  export function processElement(element,options){
      processKey(element)           //解析key属性

      element.plain = (             //如果该节点没有属性没有key没有插槽的话，就认为是个plain节点，我个人认为跟静态节点差不多，当然了其子节点当然不是静态的
        !element.key &&
        !element.scopedSlots &&
        !element.attrsList.length  
      )

        return element
  }
  function processKey(el){
    const exp = getBindingAttr(el,'key')    //获得key 的动态绑定属性
    el.key = exp
  }