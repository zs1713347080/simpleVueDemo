let id = 0
export class Dep{
    constructor(){
        this.id = id++;
        this.subs = [];
        this.watcherIdSet = {}
    }
    addSub(watcher){
        if(!this.watcherIdSet[watcher.id]){
            this.subs.push(watcher);
            this.watcherIdSet[watcher.id] = true;
        }
    }
    notify(){
        const subs = this.subs.slice();
        subs.sort((a,b)=>a.id-b.id)
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
export function pushTarget(watcher){
    Dep.target = watcher;
    stack.push(watcher)
}
export function popTarget(){
    stack.pop();
    Dep.target = stack[stack.length - 1]
}