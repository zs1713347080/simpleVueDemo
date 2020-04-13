import Vue from "../source/index.js"

let vm = new Vue({
    el:'#app',
    data(){
        return {
            aaa:'111',
            bbb:{
                aaa:'222',
                bbb:'333'
            }
        }
    }
})

vm.aaa = 333

setTimeout(function(){
    vm.aaa = '222'
    console.log('改变',vm)
},1000)