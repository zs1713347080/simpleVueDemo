import { remove } from "../shared/util";

let uid = 0
export class Dep{
    constructor(){
        this.id = uid++;
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
        for(let i = 0,l = this.subs.length;i<l;i++){
            subs[i].update();
        }
    }
    removeSub(sub) {
        remove(this.subs, sub)
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