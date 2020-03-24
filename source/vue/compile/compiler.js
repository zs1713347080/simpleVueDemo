export function compiler(node,vm){
    let childNodes = node.childNodes;
    [...childNodes].forEach(element=>{
        if(element.nodeType ==1 ){  //元素节点
            compiler(element,vm)
        } else if(element.nodeType == 3){   //文本节点
            compilerText(element,vm)
        }
    })
}
const defaultRE = /\{\{((?:.|\r\n)+?)\}\}/g
export function compilerText(node,vm){
    if(!node.textString){
        node.textString = node.textContent
    }
    node.textContent = node.textString.replace(defaultRE,function(...args){
        return JSON.stringify(getValue(vm,args[1]))
    })
}
export function getValue(vm,expr){
    let keys = expr.trim().split('.');
    return keys.reduce((memo,current)=>{
        memo = memo[current];
        return memo
    },vm)
}
import {parse} from './parser/parse.js';
import { optimize } from './optimize'
import { arrayMethods } from '../observe/array.js';
import { generate } from './generateCode/index'

let baseOptions = 'baseoptions'

export const createCompiler = createCompilerCreator(function baseCompile (          //生成createCompiler函数
    template,
    options
  ) {
    const ast = parse(template.trim(), options)
      optimize(ast, options)                //优化
    const code = generate(ast, options)
    return {
      ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  })


export const { compile, compileToFunctions } = createCompiler(baseOptions)             //生成compile函数和compileToFunctions函数关键是传入baseOptions，函数柯里化的第一步


  export function createCompilerCreator(baseCompile){
    return function createCompiler(baseOptions){
        function compile(template,options){
            //这一步执行的merge

            const compiled = baseCompile(template,options)          //这一步才是真正的调用编译的方法
            console.log('ast语法树',compiled.ast)
            return compiled  //返回编译结果
        }
        return {
            compile,
            compileToFunctions:createCompileToFunctionFn(compile)           //最后将compile传入createCompileToFunctionFn函数
        }
    }
  }

  export function createCompileToFunctionFn(compile){
    const chache = Object.create(null)    //做一个编译之后的缓存
    return function compileToFunctions(template,options,vm){
        //前面进行环境的判断，环境能力的检测
        
        const compiled = compile(template, options)             //调用compile函数进行编译
        console.log(compiled.render,'\nrender函数字符串')
        //判断编译是否有error   tips 等，以便做出相应的提示
        return {
            render:createFunction(compiled.render,'创建render函数出错'),
            staticRenderFns:compiled.staticRenderFns.map(code => {
                return createFunction(code, '创建staticRenderFn函数出错')
            })
        }
    }
  }


  function createFunction(code,errorText){
      try{
          return new Function(code)
      } catch (err){
          console.log(err)
          console.log(errorText)
      }
  }

