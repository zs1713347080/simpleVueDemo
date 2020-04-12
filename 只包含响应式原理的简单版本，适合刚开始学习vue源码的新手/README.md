# 人人都能看懂学会的响应式原理，只包含对象的监听和next-Tick异步更新

这个项目的目的是让那些只是打算大致了解数据响应式原理和next-tick原理的人，简化了代码结构，更容易理解，如果条件允许的话上手写一些代码相信会理解的更深刻的。

在这里把项目的目录结构说一下。

````
|public					//就是个目录
|	-index.html			//项目html的打包入口DOM的挂载点根节点在这里呢
|source
|	|compiler
|	|	-index.js		//简易地模拟编译过程，其实是对文本节点中双括号表达式地处理
|	|observe			//响应式原理代码
|	|	-dep.js			//dep类
|	|	-index.js		//响应式的初始化
|	|	-Observer.js	//Observer类	
|	|	-watcher.js		//Watcher类
|	|util
|	|	-next-Tick.js	//next-Tick方法
|	-index.js		//vue的简易生命周期函数
|src
|	-index.js			//项目打包的入口，vue的导出位置，测试vue的功能在这里写
````

