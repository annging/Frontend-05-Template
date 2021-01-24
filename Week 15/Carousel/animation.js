import { linear } from "./timingFunction.js"

const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS  = Symbol("animations");
const START_TIME = Symbol("start-time");
const PAUSE_START = Symbol("pause-start");
const PAUSE_TIME = Symbol("pause-time");

export class Timeline {
    constructor() {
        this.state = "Inited"; // 这个状态是可见的
        this[ANIMATIONS] = new Set();
        this[START_TIME] =  new Map();
    }

    start() {
        if (this.state !== "Inited") {
            return;
        }
        this.state = "started";
        let startTime = Date.now();
        this[PAUSE_TIME] = 0; // 暂停持续的时间 默认是0 其在resume计算

        this[TICK] = () => {
            // console.log("tick");
            let now = Date.now();
            for (let animation of this[ANIMATIONS]) {
                let t;
                if (this[START_TIME].get(animation) < startTime) {
                    // 动画开始以前 添加的animation
                    t = now - startTime - this[PAUSE_TIME] - animation.delay; // 
                } else {
                    // 动画开始以后添加的animation
                    t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;
                }
                if (animation.duration < t) {
                    this[ANIMATIONS].delete(animation);
                    t = animation.duration;
                }
                if (t > 0) {
                    animation.receiveTime(t);
                }
            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        }
        this[TICK]();
    }

    /*set rate() { }
    get rate() { }*/ 

    pause() {
        if (this.state !== "started") {
            return;
        }
        this.state = "paused";

        this[PAUSE_START] = Date.now(); // 暂停事件发生的时间
        cancelAnimationFrame(this[TICK_HANDLER]); //  动画彻底停下来了
    } // 暂停
    resume() {
        if (this.state !== "paused") {
            return;
        }
        this.state = "started";
        
        this[PAUSE_TIME] += Date.now() -  this[PAUSE_START]; // 暂停持续的时间
        this[TICK]();
    } // 恢复

    reset() {
        this.state = "Inited";
        
        this.pause();
        // reset
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[ANIMATIONS] = new Set();
        this[START_TIME] =  new Map();
        this[PAUSE_START] = 0;
        this[TICK_HANDLER] = null;
    }

    add(animation, startTime) {
        if (arguments.length < 2) {
            startTime =  Date.now();
        } // 参数不足的时候，给startTime一个默认值
        this[ANIMATIONS].add(animation);
        this[START_TIME].set(animation, startTime);
    }
    remove() {

    }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.timingFunction = timingFunction || linear;
        this.delay = delay;
        this.template = template || (v => v);
    }
    receiveTime(time) {
        let range = (this.endValue -  this.startValue);
        let progress = this.timingFunction(time / this.duration);
        this.object[this.property] = this.template(this.startValue + range * progress)
    }
}