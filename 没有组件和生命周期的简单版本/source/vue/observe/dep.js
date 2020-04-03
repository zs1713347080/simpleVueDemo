let uid = 0
export class Dep{
    constructor(key){
        this.key = key
        this.id = uid++;
        this.subs = [];
        this.watcherIdSet = {}
    }
    addSub(watcher){                                //添加订阅者
        if(!this.watcherIdSet[watcher.id]){
            this.subs.push(watcher);
            this.watcherIdSet[watcher.id] = true;
        }
    }
    notify(){                                       //通知所有订阅者，实际上就是执行所有订阅者的update方法
        const subs = this.subs.slice();
        for(let i = 0,l = this.subs.length;i<l;i++){
            subs[i].update();
        }
    }
    depend(){
        if(Dep.target){
            Dep.target.addDep(this)     //互相记忆
        }
    }
}
let stack = []
export function pushTarget(watcher){                    //watcher入栈
    Dep.target = watcher;
    stack.push(watcher)
}
export function popTarget(){                            //watcher出栈
    stack.pop();
    Dep.target = stack[stack.length - 1]
}