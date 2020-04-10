
import { parse } from './parser/parse.js';
import { optimize } from './optimize'
import { generate } from './generateCode/index'


let baseOptions = 'baseoptions'

export const createCompiler = createCompilerCreator(function baseCompile (          //生成createCompiler函数
    template,
    options
  ) {
    const ast = parse(template.trim(), options)             //解析
      optimize(ast, options)                //优化
    const code = generate(ast, options)         //生成render函数字符串
    return {
      ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  })


export const { compile, compileToFunctions } = createCompiler(baseOptions)             //生成compile函数和compileToFunctions函数关键是传入baseOptions，函数柯里化的第一步


  export function createCompilerCreator(baseCompile){
    return function createCompiler(baseOptions){                //函数柯里化，让baseCompile和baseOptions可以分开传递，源码是放在了不同的文件里
        function compile(template,options){
            //这一步执行的merge

            const compiled = baseCompile(template,options)          //这一步才是真正的调用编译的方法
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

