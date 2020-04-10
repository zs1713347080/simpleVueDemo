

import { initExtend } from './extend'
import { ASSET_TYPES } from '../../shared/constants'
import { extend } from '../../shared/util';
import builtInComponents from '../components/index'
import { initAssetRegisters } from './assets';
export function initGlobalAPI(Vue){


    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(type=>{
        Vue.options[type + 's'] = Object.create(null)
    })
    Vue.options._base = Vue

    extend(Vue.options.components, builtInComponents)       //目前是组件 keepAlive相关的方法
    

    initExtend(Vue)

    initAssetRegisters(Vue)
}