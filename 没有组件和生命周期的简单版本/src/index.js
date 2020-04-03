import Vue from "../source/vue/index"

let vm = new Vue({
    template:
        `<div>
            <span v-for="(item,key) in sz">
                <div v-if="key===0" style="color:red">
                    {{item}}
                </div>
                <div>
                    {{item}}
                </div>
            </span>
            <div>{{object.a}}</div>
            <div>{{ppp}}</div>
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
    },
    computed:{
        ppp(){
            return this.bb + '11'
        }
    }
})
setTimeout(function(){
    vm.bb = 'bbbb'
    vm.Vif = false
    vm.sz = [4,5]
    vm.object.a = [4,5]
},1000)

