import { Timeline, Animation } from '../animation.js'
import { ease, easeIn, easeOut, easeInOut} from '../timingFunction.js'

let tl = new Timeline();

// tl.start();

let $el1 = document.querySelector("#el1");
let $el2 = document.querySelector("#el2");
tl.add(new Animation($el1.style, "transform", 0, 500, 2000, 0, ease,  v => `translateX(${v}px)`));

document.querySelector("#start").addEventListener("click", () => {tl.start()}); // start 按钮 绑定tl的 start 事件
document.querySelector("#pause").addEventListener("click", () => {tl.pause()}); // pause 按钮 绑定tl的 pause 事件
document.querySelector("#resume").addEventListener("click", () => {tl.resume()}); // resume 按钮 绑定tl的 resume 事件
document.querySelector("#reset").addEventListener("click", () => {tl.reset()}); // reset 按钮 绑定tl的 reset 事件

// el1 和 el2 对比下 timingFunction
window.onload = function () {
    $el2.style.transition = "transform ease 2s ";
    $el2.style.transform = "translateX(500px)";
    tl.start();
};
