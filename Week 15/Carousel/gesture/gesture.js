export class Dispatcher {
    constructor(element) {
        this.element = element;
    }
    dispatch(type, properties) {
        // let event = new CustomEvent()
        let event = new Event(type);
        console.log(event);
        for (let name in properties) {
            event[name] = properties[name];
        }
        this.element.dispatchEvent(event); // 派发在element上
    }
}


// listen recognizer dispath
export class Listener  {
    constructor(element, recognizer) {
        let isListeningMouse = false; // 处理监听，如果已经绑定了就不再重复绑定mosemove mouseup。

        let contexts  = new Map(); //使用map contexts 来保存context

        // 鼠标
        element.addEventListener("mousedown", event => {
            // 在这里函数里处理按键
            // console.log(event.button);
            let context = Object.create(null); // 避免object上原始的属性来添乱
            contexts.set("mouse" + (1 << event.button), context); // (1 << event.button) 1 2 4 8 16 32
        
            recognizer.start(event, context);
            let mousemove = event => {
                // console.log(event.clientX, event.clientY);
                // mousemove 里 event 没有 button 有 buttons 表示有哪些键被摁下来了。掩码设计
                let button = 1;
        
                while(button <= event.buttons) {
                    // 键摁下去才会触发回调 注意event.buttons中的顺序 中键和右键
                    if (button & event.buttons) { // 按位与
                        
                        let key;
                        { // 中箭和右键的顺序调换
                            if (button === 2) {
                                key = 4;
                            } else if (button === 4) {
                                key = 2;
                            } else {
                                key = button;
                            }
                        }
                        let context = contexts.get("mouse" + key);
                        recognizer.move(event, context);
                    }
                    button = button << 1; // 移位操作   1<< event.button 和这里都没有验证，后验证。
                }
                
            }
            let mouseup = event => {
                // 同时摁下多个键的时候 mouseup 绑定了多次。
                console.log("end", event.button);
                let context = contexts.get("mouse" + (1<< event.button));
                recognizer.end(event, context);
                contexts.delete("mouse" + (1<< event.button));
        
                if (event.buttons === 0) { // 如果buttons里空了， 取消监听事件
                    document.removeEventListener("mousemove", mousemove); // capture once passive
                    document.removeEventListener("mouseup", mouseup);
                    isListeningMouse = false; // 重置
                }
            };
        
            // 避免重复绑定
            if(!isListeningMouse) {
                document.addEventListener("mousemove", mousemove);
                document.addEventListener("mouseup", mouseup);
                isListeningMouse = true;
            }
        })

        // 触屏
        element.addEventListener("touchstart", event => {
            for (let touch of event.changedTouches) {
                // console.log("start", touch.clientX, touch.clientY);
                let context = Object.create(null);
                contexts.set(touch.identifier, context); // 以touch 的 identifier 为key
                recognizer.start(touch, context);
            }
        })
        element.addEventListener("touchmove", event => {
            for (let touch of event.changedTouches) {
                // console.log("move", touch.clientX, touch.clientY);
                let context = contexts.get(touch.identifier);
                recognizer.move(touch, context);
            }
        })
        element.addEventListener("touchend", event => {
            for (let touch of event.changedTouches) {
                // console.log("end", touch.clientX, touch.clientY);
                let context = contexts.get(touch.identifier);
                recognizer.end(touch, context);
                contexts.delete(touch.identifier);
            }
        })
        element.addEventListener("touchcancel", event => {
            for (let touch of event.changedTouches) {
                // console.log("cancel", touch.clientX, touch.clientY);
                let context = contexts.get(touch.identifier);
                recognizer.cancel(touch, context);
                contexts.delete(touch.identifier);
            }
        }) // 触屏会被alert等其他系统操作打断 这个时候会发生 touchcancel





    }
}

export class Recognizer  {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    start(point, context) {
        // console.log("start", point.clientX, point.clientY);
        context.startX = point.clientX, context.startY = point.clientY;
    
        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        }]; // 用于处理 flick
    
        context.isTap = true;
        context.isPan = false;
        context.isPress = false;
    
        context.handler = setTimeout(() => {
            context.isTap = false;
            context.isPan = false;
            context.isPress = true;
            context.handler = null; // 这里避免多次clearTimeout 会发生糟糕的事情。
            // console.log("press"); // pressStart
            this.dispatcher.dispatch("press", {});
        }, 500) // 0.5s
    
        // dispatch("move", {});
    }
    move(point, context) {
        // console.log("move", point.clientX, point.clientY);
        // 是否移动了10px (5px 10p 15px)
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
        if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
            context.isTap = false;
            context.isPan = true;
            context.isPress = false;
            context.isVerticla = Math.abs(dx) < Math.abs(dy);
            // console.log("panStart");
            this.dispatcher.dispatch("panStart", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVerticla: context.isVerticla
            });
            clearTimeout(context.handler);
        }
        if (context.isPan) {
            // console.log(dx,dy);
            // console.log("pan"); // pan
            this.dispatcher.dispatch("pan", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVerticla: context.isVerticla
            });
        }
    
        context.points = context.points.filter(point => Date.now() - point.t < 500); // 只存取半秒内的点
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        });
    
        // dispatch("move", {});
    
    }
    end(point, context) {
        // tap逻辑
        if (context.isTap) {
            // console.log("tap");
            this.dispatcher.dispatch("tap", {});
            clearTimeout(context.handler);
        }
        
        if (context.isPress) {
            // console.log("pressend");
            this.dispatcher.dispatch("tap", {});
        }
        context.points = context.points.filter(point => Date.now() - point.t < 500); // 只存取半秒内的点
        let d, v;
        if (!context.points.length) {
            v = 0;
        } else {
            d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y));
            v = d / (Date.now() - context.points[0].t);
        }
        console.log(v);
    
        if (v > 1.5) { // 1.5 像素/毫秒   超过1.5我们认为是比较快的速度
            // console.log("is flick");
            context.isFlick = true;
            this.dispatcher.dispatch("flick", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVerticla: context.isVerticla,
                isFlick: context.isFlick,
                velocity: v
            });
        } else {
            context.isFlick = false;
        }
        if (context.isPan) {
            // console.log("panend"); // move 时已经clearTimeout
            this.dispatcher.dispatch("panend", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVerticla: context.isVerticla,
                isFlick: context.isFlick
            });
        }
        // console.log("end", point.clientX, point.clientY);
    }
    
    cancel(point, context) {
        clearTimeout(context.handler);
        // console.log("cancel", point.clientX, point.clientY);
        this.dispatcher.dispatch("cancel", {});
    }
}

export function enableGesture(element) {
    new Listener(element, new Recognizer(new Dispatcher(element)))
}