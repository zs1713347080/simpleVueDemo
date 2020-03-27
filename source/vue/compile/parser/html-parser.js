import { isNonPhrasingTag, canBeLeftOpenTag, isUnaryTag } from "../../platform/web/compiler/util"
import { makeMap } from '../../shared/util'

//正则表达式部分
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/  //匹配unicode编码的字符      

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/                   //匹配最近的一个属性
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/     //匹配动态属性
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`        //匹配变量名，关键字啥的

const qnameCapture = `((?:${ncname}\\:)?${ncname})`                     //匹配变量名:变量名  或 变量名  的组合
const startTagOpen = new RegExp(`^<${qnameCapture}`)                    //匹配标签的前半段(无论是开始标签还是结束标签，都是只匹配前半段)
const startTagClose = /^\s*(\/?)>/                                      //匹配结束标签

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)                 //结束标签
const comment = /^<!\--/                        //匹配注释节点的开头
const doctype = /^<!DOCTYPE [^>]+>/i            //匹配标明文档类型的节点
const conditionalComment = /^<!\[/              //匹配条件注释

const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g                             //属性符号的编码
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g          //带新行的编码属性



//正则表达式部分

//字符编码转换部分

const decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
  }
//字符编码转换部分


//工具函数部分
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'  //是否需要忽略第一个换行符

function decodeAttr (value, shouldDecodeNewlines) {                     //解析行内标签
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}



  //这部分从其他地方挪过来的

export const inBrowser = typeof window !== 'undefined'                  //判断是否处于浏览器环境

let div
function getShouldDecode (href) {                               //检测是否需要解析href 或者a属性里的换行符
    div = div || document.createElement('div')
    div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`           
    return div.innerHTML.indexOf('&#10;') > 0                   //如果有换行符
}
  export const shouldDecodeObj = {
    shouldDecodeNewlines:inBrowser ? getShouldDecode(false) : false,
    shouldDecodeNewlinesForHref:inBrowser ? getShouldDecode(true) : false
  }

  //这部分从其他地方挪过来的


//工具函数部分

export function parseHTML(html,options){
    const stack = []        //用于记录入栈出栈的标签，好一对匹配开标签和闭合标签
    let index = 0;
    let last, lastTag;      //lasttag记录栈顶的元素标签名
    while(html){            

        //这一步是匹配标签的
        last = html;
        //源码在这里会判断一下，确保不是在style或者js这样的纯文本标签中
        let textEnd = html.indexOf('<')
        if(textEnd === 0){  //如果字符串的开头就是<字符

            if(comment.test(html)){             //如果开头是注释节点
                const commentEnd = html.indexOf('-->')
                if(commentEnd >= 0){
                    advance(commentEnd + 3) //字符串向后挪动commentEnd +3 位，跳过注释节点
                    continue;
                }
            }
            
            if(conditionalComment.test(html)) {                 //匹配条件注释节点并跳过
                const conditionalEnd = html.indexOf(']>')
                if(conditionalEnd >= 0){
                    advance(conditionalEnd + 2)
                    continue;
                }
            }

            const doctypeMatch = html.match(doctype)        //匹配文档标注节点
            if(doctypeMatch){
                advance(doctypeMatch[0].length)         //这里仍然是一样的操作，跳过该节点
                continue
            }
  
            const endTagMatch = html.match(endTag)          //匹配结束标签
            if(endTagMatch){             
                const curIndex = index;
                advance(endTagMatch[0].length)
                parseEndTag(endTagMatch[1], curIndex, index)            
                continue;
            }

            const startTagMatch = parseStartTag()               //匹配开始标签
            if(startTagMatch){
                handleStartTag(startTagMatch)                       //生成该标签的ast节点
                if(shouldIgnoreFirstNewline(startTagMatch.tagName, html)){          //是否需要忽略第一个换行符
                    advance(1)
                }
                continue
            } 
        }

        //这里是匹配文本的
        let text, rest, next
        if(textEnd >= 0){      //如果开头不是<字符
            rest = html.slice(textEnd)          //rest 就是跳过<字符前面的内容剩下的内容
            while(
                !endTag.test(rest) &&
                !startTagOpen.test(rest) &&
                !comment.test(rest) &&
                !conditionalComment.test(rest)
            ){                                      //不能成功匹配任何类型标签的开始符，就将其认定为在文本中
                next = rest.indexOf('<', 1)         //找到文本节点后面的标签的开头符号的位置
                if(next <0)break            //找不到就结束
                textEnd += next;              //如果文本中存在<就重新调整位置好让textEnd记录的是准确的标签开头位置
                rest = html.slice(textEnd)      //跳过匹配过的
            }
            text = html.substring(0,textEnd)        //截取正确的文本节点
        }

        if(textEnd < 0 ){               //如果要解析的内容中没有了 <字符，说明全是文本没有标签
            text = html
        }

        if(text){                       //跳过当前解析到的文本
            advance(text.length)
        }

        if(options.chars && text){                      
            options.chars(text, index - text.length, index)         //将匹配到的文本节点记录到AST语法树中
        }
    }

    function advance(n){                //字符串解析跳过n位
        index += n;
        html = html.substring(n)
    }
    
    function parseStartTag(){                       //匹配开始标签的标签名和属性 返回一个match对象
        const start = html.match(startTagOpen)
        if(start){
            const match = {
                tagName:start[1],
                attrs:[],
                start:index                     //记录match的开始
            }
            advance(start[0].length)
            let end, attr 
            while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute)) ){      //匹配标签内的属性直到遇到闭合标签>或自闭合标签/>
                attr.start = index;
                advance(attr[0].length)
                attr.end = index;
                match.attrs.push(attr)              //存进来的是key="value"这样的格式，而且前面还有空格,所以需要进一步解析
            }
            if(end){
                match.unarySlash = end[1]
                advance(end[0].length)
                match.end = index                   //记录match的结尾
                return match
            }
    
        }
    }
    
    function handleStartTag (match){
        const tagName = match.tagName;
        const unarySlash = match.unarySlash     //用来记录是否是单独闭合的标签，如果是自闭合标签，就不必再推入栈中等待闭合标签了

        if(true){     //这里是取自配置项options里的expectHTML变量，这个变量的值是true 目前不知道是干嘛用的 
            if(lastTag === 'p' && isNonPhrasingTag(lastTag)){           //判断是否是预留的标签名
                parseEndTag(lastTag)
            }
            if(canBeLeftOpenTag(tagName) && lastTag === tagName){               //判断是否是另一种预留的标签名
                parseEndTag(tagName)
            }
        }

        const unary = isUnaryTag(tagName) || !!unarySlash                   //如果不是一元的标签类型就赋值给unary变量
        let l = match.attrs.length;                         //保留key的数量
        const attrs = new Array(l);
        for(let i = 0;i<l;i++){
            const args = match.attrs[i]
            const value = args[3] || args[4] || args[5] || ''                       //取到键值对的key

            const shouldDecodeNewlines = tagName ==='a' && args[1] === 'href'          //如果是单行元素或者具有href属性的话的话需要进行另外的操作
            ? shouldDecodeObj.shouldDecodeNewlinesForHref
            : shouldDecodeObj.shouldDecodeNewlines
            attrs[i] = {                                                                     //解析标签里的属性
                name:args[1],
                value: decodeAttr(value, shouldDecodeNewlines)
            }

            if(true){        //这里判断的是如果在非生产环境的话，把属性匹配的前面空格去掉
                attrs[i].start = args.start + args[0].match(/^\s*/).length
                attrs[i].end = args.end
            }
        }

        if(!unary){     //如果不是单元标签或者自闭和标签就推入stack中
            stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
            lastTag = tagName       //记录栈顶元素，好出栈
        }
        if(options.start){
            options.start(tagName, attrs, unary, match.start, match.end)
        }
    }
    
    function parseEndTag(tagName, start, end){
        let pos, lowerCasedTagName
        if(start == null) start = index 
        if(end == null) end = index

        //匹配到栈顶最近的一个同名开标签进行匹配
        if(tagName) {
            lowerCasedTagName = tagName.toLowerCase()
            for(pos = stack.length - 1 ;pos>=0; pos--){
                if(stack[pos].lowerCasedTag === lowerCasedTagName){ //匹配到同名结束标签
                    break;
                }
            }
        } else {
            //如果没有标签名
            pos = 0
        }

        if(pos >=0){     //匹配到标签名
            // 将该标签名后面进栈的标签全部出栈，并提示标签没有结束标签(提示的代码我就没写)
            for(let i = stack.length - 1;i>=pos;i--){
                if (options.end) {
                    options.end(stack[i].tag, start, end)
                }
            }
            stack.length = pos
            lastTag = pos && stack[pos - 1].tag
        } else if (lowerCasedTagName === 'br'){
            if(options.start){
                options.start(tagName, [], true, start, end)
            }
        } else if (lowerCasedTagName === 'p'){
            if(options.start){
                options.start(tagName, [], false, start, end)
            }
            if(options.end) {
                options.end(tagName, start, end)
            }
        }

    }
}