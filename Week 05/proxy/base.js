/**
 *  通过proxy包裹一个普通对象，使这个对象被监听。 
 *  语法： const p = new Proxy(target, handler)
 *  ！：proxy是可以自定义基本操作的行为，所以是个很危险的特性。
 */

 let object = {
     a: 1,
     b: 2
 } //这是个普通对象，不可被监听（observe）。

let pp = new Proxy(object, {
    set(obj, prop, val) {
        console.log("obj:");
        console.log(obj);
        console.log("--------------");
        console.log("prop:");
        console.log(prop);
        console.log("--------------");
        console.log("val:");
        console.log(val);
    }
})

console.log("pp.a = 3 ：")
pp.a = 3