import { mergeOptions } from "../util/options"
import { ASSET_TYPES } from "../../shared/constants"
import { extend } from "../../shared/util"


export function initExtend(Vue){

    Vue.cid = 0
    let cid = 1

    Vue.extend = function (extendOptions){      //extendOptions是用户传过来的组件的options
        extendOptions = extendOptions || {}
        const Super = this                      //获得Vue的引用    
        const SuperId = Super.cid
        var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor={});

        if(cachedCtors[SuperId]){               //如果有已经存在的构造器就直接返回
            return cachedCtors[SuperId]
        }

        var name = extendOptions.name || Super.options.name;

        // if(name){
        //     validateComponentName(name)              //验证组件名称的合法性
        // }


        var Sub = function VueComponent(options){
            this._init(options)
        }
        Sub.prototype = Object.create(Super.prototype)      //重新创建原型
        Sub.prototype.constructor = Sub
        Sub.cid = cid++
        Sub.options = mergeOptions(
            Super.options,
            extendOptions
        )
        Sub['super'] = Super        //记录父类
        
        //允许进一步 扩展/混入/插件 继承使用
        Sub.extend = Super.extend

        ASSET_TYPES.forEach(function(type) {
            Sub[type] = Super[type]
        })

        //启用递归自查找
        if(name){
            Sub.options.components[name] = Sub
        }

        Sub.superOptions = Super.options
        Sub.extendOptions = extendOptions
        Sub.sealedOptions = extend({}, Sub.options)

        //缓存构造器
        cachedCtors[SuperId] = Sub
        return Sub

    }
}