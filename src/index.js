import { Vue } from "../source/vue/index"

let vm = new Vue({
    template:
        `<div>
            <span v-for="(item,key) in sz">{{item}}</span>
            <div>111</div>
        </div>`,
    el:'#app',
    data:{
        isShow:true,
        Vif:true,
        show:true,
        sz:[1,2,3],
        object:{
            a:'111'
        },
        bb:11,
        cc:'哈哈',
        array:[[1,2],2,3]
    },
    watch:{
        object:function(newValue,oldValue){
            console.log('监听到数据变化',newValue,oldValue)
        }
        // bb:function(newValue,oldValue){
        //     console.log('监听到数据变化',newValue,oldValue)
        // }
    },
    computed:{
        ppp(){
            return this.bb + '11'
        }
    }
})
setTimeout(function(){
    vm.bb = 'bbbb'
    vm.if = false
},0)



let my = `with(this){return _c('div',[_l((sz),function(item,key){return _c('span',[_v(_s(item))])})],2)}`
let vv = `with(this){return _c('div',_l((sz),function(item,key){return _c('span',[_v(_s(item))])}),0)} `

