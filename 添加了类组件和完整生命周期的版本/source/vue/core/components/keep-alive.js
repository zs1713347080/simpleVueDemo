


export default {                    //keep-Alive内置组件的代码
    name:'keep-alive',
    abstract:true,

    props:{
        include: null,
        exclude:null,
        max:null
    },

    created(){
        this.cache = Object.create(null);
        this.keys = []
    },

    destroyed (){

    },

    mounted () {

    },

    render () {
        
    }
}