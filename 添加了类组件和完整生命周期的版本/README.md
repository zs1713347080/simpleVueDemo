# 这个是有v-if丶v-for丶双括号表达式丶watch丶computed、模板编译、类组件丶生命周期丶

这个项目的目的是让那些只是打算大致了解模板编译流程，数据响应式原理，计算属性，侦听器，diff算法，virtual DOM思想，类组件，生命周期，next-tick原理的人，组件简化了代码结构，更容易理解，如果条件允许的话上手写一些代码相信会理解的更深刻的。

在这里把项目的目录结构说一下，可能会跟vue源码的目录结构不太一样。

````
|public					//就是个目录
|	-index.html			//项目html的打包入口DOM的挂载点根节点在这里呢
|source
|	|vue				//vue的源码在这里，为啥要单独开一个文件呢，因为我还想搞vuex和router呢哈哈
|	|	|complie		//模板编译过程相关的代码
|	|	|	|generateCode		//生成render函数相关的代码
|	|	|	|	-index.js				//生成render函数的代码
|	|	|	|parser				//解析模板相关的代码
|	|	|	|	-html-parser.js			//解析模板的入口函数就在这里定义，是主要的逻辑
|	|	|	|	-parse.js				//ast初步生成是在这里，源码把ast生成和解析模板巧妙地分	|	|	|	|								开了，这样就可以只关注需要的逻辑
|	|	|	|	-text-parser.js			//这里有个解析text的工具函数
|	|	|	-compiler.js		//编译过程的入口在这里
|	|	|	-helper.js			//编译过程的一些工具函数
|	|	|	-optimize.js		//优化相关的过程
|	|	|	
|	|	|core			//核心代码
|	|	|	|components			//内置组件目录
|	|	|	|	-index.js		//目录输出文件
|	|	|	|	-keep-alive.js		//keepAlive组件配置，这个版本不支持该功能
|	|	|	|global-api
|	|	|	|	-assets.js			//给vue混入components接口
|	|	|	|	-extend.js			//vue.extend定义的地方
|	|	|	|	-index.js			//给vue混入全局api的函数
|	|	|	|helpers			//工具函数
|	|	|	|	-normalize-children.js			//规范化子节点相关的函数
|	|	|	|instance
|	|	|	|	|render-helpers					//render过程需要的函数
|	|	|	|	|	-index.js				//定义了往vue原型上挂载render过程需要的函数的函数
|	|	|	|	|	-render-list.js			//渲染list的时候需要的函数
|	|	|	|	|	-render-static.js		//渲染静态节点的时候需要的函数
|	|	|	|vdom
|	|	|	|	-create-component.js		//createComponent函数的定义和组件的生命周期钩子
|	|	|	|	-create-element.js			//生成vnode节点的一些方法
|	|	|	|	-patch.js					//生成patch函数的闭包函数在这里定义，是diff的主要 |   |   |   |								逻辑实现位置
|	|	|	|	-vnode.js					//定义Vnode类的位置
|	|	|
|	|	|observe		//响应式原理相关代码
|	|	|	-array.js			//对原生array方法进行劫持的位置
|	|	|	-dep.js				//定义dep类的位置
|	|	|	-index.js			//初始化状态函数initState函数定义的位置
|	|	|	-observer.js		//Observer类定义
|	|	|	-watcher.js			//Watcher类定义
|	|	|
|	|	|platform		//跨平台相关的代码，vue的台能力靠的是这里，其实对我来说都一样，只实现web
|	|	|	|web
|	|	|		|compiler
|	|	|		|	-util.js		//模板编译过程检测一些标签合法性的工具函数
|	|	|		|runtime			//render过程需要的一些支持
|	|	|		|	-index.js		//混入mount函数和patch函数的定义，源码没有这个，我自己加的
|	|	|		|	-node-ops.js	//patch的时候操作dom的适配层，在原生方法上封装了一层
|	|	|		|	-patch.js		//patch方法的定义
|	|	|	|weex				//空的
|	|	|shared	
|	|	|	-constants.js	//规划vue钩子函数的地方
|	|	|	-util.js		//全局使用最多的一些工具函数就在这里了，大多数都是类型判断
|	|	-util
|	|	|	-index.js		//工具函数
|	|	|	-nextTick.js	//nextTick的定义
|	|	-ndex.js		//vue构造函数是在这里定义的
|	|	-init.js		//vue混入各种init函数的函数定义的地方
|	|	-lifecycle.js	//混入生命周期相关的函数定义的地方
|	|	-render.js		//和render相关的混入函数定义|
|src
|	-index.js			//项目打包的入口，vue的导出位置，测试vue的功能在这里写
````

