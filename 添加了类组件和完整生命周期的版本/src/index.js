import Vue from "../source/vue/index"

console.time('vue')

let comp1 =  Vue.extend({
    template: '<p>{{test}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  },
  watch:{
    alias:function(newVal,oldVal){
        console.log(newVal,oldVal)
    }
  },
  computed:{
    test(){
        return this.firstName + '-'
    }
  },
  beforeCreate(){
      console.log('组件beforeCreate')
  },
  created(){
      console.log('组件created')
  },
  beforeMount(){
      console.log('组件beforeMount')
  },
  mounted(){
      let that = this
      setTimeout(function(){
          console.log('哈哈',that)
          that.firstName = '改变改变'
          that.alias = '----////'
      },1000)
      console.log('组件mounted')
  },
  beforeUpdate(){
      console.log('组件beforeUpdate')
  },
  updated(){
      console.log('组件updated')
  },
  beforeDestroy(){
      console.log('组件beforeDestroy')
  },
  destroyed(){
      console.log('组件destroyed')
  },
})

let vm = new Vue({
    template:
        `<div>
            <div v-pre="true" v-if="false">
                {{bb}}
            </div>
            <span v-for="(item,key) in sz">
                <div v-if="key===0">
                    {{item}}
                </div>
                <div>
                    {{item}}
                </div>
            </span>
            <comp v-if="ifCom">111</comp>
        </div>`,
    el:'#app',
    components:{
        comp:comp1
    },
    data:{
        ifCom:true,
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
    beforeCreate(){
        console.log('beforeCreate')
    },
    created(){
        console.log('created')
    },
    beforeMount(){
        console.log('beforeMount')
    },
    mounted(){
        console.log('mounted')
    },
    beforeUpdate(){
        console.log('beforeUpdate')
    },
    updated(){
        console.log('updated')
    },
    beforeDestroy(){
        console.log('beforeDestroy')
    },
    destroyed(){
        console.log('destroyed')
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
setTimeout(()=>{
    vm.ifCom = false
    console.log('数据修改')
},1000)

console.timeEnd('vue')