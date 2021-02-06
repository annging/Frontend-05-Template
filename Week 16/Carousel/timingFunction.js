import { cubicBezier } from "./cubicBezier.js"

//https://cubic-bezier.com/
export let linear = v => v;
export let ease = cubicBezier(.25, .1, .25, 1);
export let easeIn = cubicBezier(.42, 0, 1, 1);
export let easeOut = cubicBezier(0, 0, .58, 1);
export let easeInOut = cubicBezier(0,0,.58,1);