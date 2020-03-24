


//val : 要被遍历的值

//render 函数，传入要遍历的变量名称，返回一个虚拟dom节点

export function renderList (val, render){           
    let ret, i, l, keys, key;
    if(Array.isArray(val) || typeof val === 'string'){          //判断被遍历的内容是数组或者字符串
        ret = new Array(val.length);
        for(i = 0, l = val.length; i<l; i++){
            ret[i] = render(val[i], i)                          //将每一项和系数都传入回调函数,并将返回的vdom存到ret数组里
        }
    } else if (typeof val === 'number'){                         //如果被遍历的内容是数字
        ret = new Array(val);
        for(i = 0; i< val ; i++){
            ret[i] = render(i+1, i)
        }
    } else if (isObject(val)) {                                 //如果是对象
        //源码在这里还有一个判断是不是迭代器的代码，我就先不实现那个了
        keys = Object.keys(val);
        ret = new Array(keys.length)
        for(i = 0,l = keys.length;i<l;i++){
            key = keys[i]
            ret[i] = render(val[i], key, i)
        }
    }
    console.log(ret,'\nrender-list的返回值')
    return ret ? ret : []
}


export function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }


