let id = 0

export class Dep {
    constructor () {
        this.id = id++;
        this.subs = [];             //订阅的集合
        this.WatcherIdSet = {}      //订阅的id的简易散列，可以快速找出是否已经订阅避免重复
    }
    addSub(watcher) {
        if(!this.WatcherIdSet[watcher.id]) {            //如果没有添加的话
            this.WatcherIdSet[watcher.id] = true
            this.subs.push(watcher)
        }
    }
    notify(){                                           //通知所有dep更新
        for(let i = 0,l = this.subs.length;i<l;i++) {
            this.subs[i].update()
        }
    }
    depend(){
        if(Dep.target) {
            Dep.target.addDep(this)         //这个是可以和watcher互相记忆对方
        }
    }
}

const stack = []

export function pushTarget(watcher) {               //将传入的watcher传入栈顶
    Dep.target = watcher;
    stack.push(watcher)
}

export function popTarget(){                        //栈顶watcher退栈
    stack.pop();
    Dep.target = stack[stack.length -1]
}