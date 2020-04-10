import { ASSET_TYPES } from "../../shared/constants";
import { isPlainObject } from "../../shared/util";


export function initAssetRegisters (Vue){           //给vue注册几个函数

    ASSET_TYPES.forEach(function(type){
        Vue[type] = function(
            id,
            definition
        ){
            if(!definition){
                return this.options[type + 's'][id]     //去记录种寻找
            } else {
                if(type === 'component' && isPlainObject(definition)){
                    definition.name = definition.name || id;
                    definition = this.options._base.extend(definition)          //如果传进来的是对象就创建一个组件，
                                                                                //跟直接vue.extend调用的同一个api
                }
                if(type === 'directive' && typeof definition === 'function'){
                    //暂时不写目前还没想着实现这个功能
                }
                //记录构造器
                this.options[type + 's'][id] = definition
                return definition
            }
        }
    })
}