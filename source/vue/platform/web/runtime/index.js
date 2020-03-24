import { Vue } from '../../../index'
import { query } from '../../../util'
import { mountComponent } from '../../../lifecycle'
import { initMount } from '../entry-runtime-with-compiler'


// export function mountMixin(Vue){
//     Vue.prototype.$mount = initMount(Vue)
// }

console.log(Vue)

Vue.prototype.$mount = function (el, hydrating){
    el = el ? query(el) : undefined             //源码在这里会进行一个是否处于浏览器环境的判断
    return mountComponent(this, el, hydrating)
}


export default Vue