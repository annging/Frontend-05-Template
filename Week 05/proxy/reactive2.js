/**
 *  通过proxy包裹一个普通对象，使这个对象被监听。  支持p.a.b
 *  语法： const p = new Proxy(target, handler)
 *  ！：proxy是可以自定义基本操作的行为，所以是个很危险的特性。
 */

let callbacks = new Map();
let reactivties = new Map(); //加入缓存的逻辑

let usedReactivities = [];

let object_react = {
    a: {b: 8},
    b: 7
} //这是个普通对象，不可被监听（observe）。

let po = reactive(object_react) //现在可监听



effect(()=> {
    console.log(po.a.b);
})

function effect(callback) {
    //callbacks.push(callback);
    usedReactivities = [];
    callback();
    console.log(usedReactivities);
    for(let reactivity of usedReactivities) {
        // 空对象
        if(!callbacks.has(reactivity[0])) {
            callbacks.set(reactivity[0], new Map());
        }
        // 空属性
        if(!callbacks.get(reactivity[0]).has(reactivity[1])) {
            callbacks.get(reactivity[0]).set(reactivity[1], []);
        }
        callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
    }

}

function reactive(object){
    if(reactivties.has(object)) {
        return reactivties.get(object);
    }
    let proxy = new Proxy(object, {
        set(obj, prop, val) {
            obj[prop] = val;
            if(callbacks.get(obj)) {
                if(callbacks.get(obj).get(prop)) {
                    for(let callback of callbacks.get(obj).get(prop)) {
                        callback();
                    }
                }
            }
            return obj[prop];
            
            console.log(obj, prop, val);
        },
        get(obj, prop) {
            usedReactivities.push([obj, prop]);
            if(typeof obj[prop] === 'object') {
                return reactive(obj[prop])
            }
            console.log(obj, prop);
            return obj[prop];
        }
     })

     reactivties.set(object, proxy);
     return proxy;
}

// console.log("po.a = 44 ：")
// po.a = 44