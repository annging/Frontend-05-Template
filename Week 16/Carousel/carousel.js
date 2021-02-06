import { Component } from './framework'
import { enableGesture } from "./gesture.js"
import { Timeline, Animation } from './animation.js'
import { ease, easeIn, easeOut, easeInOut} from './timingFunction.js'

export class Carousel extends Component {
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    console.log(this.attributes.src);
    for(let record of this.attributes.src) {
      let child = document.createElement("div");
      child.style.backgroundImage =  `url(${record})`;
      this.root.appendChild(child);
    }

    enableGesture(this.root);

    let timeline = new Timeline();
    timeline.start();

    let handler;

    let children = this.root.children;

    let position = 0;
    let t = 0;
    let duration =  500;
    let ax = 0; // 动画造成的位移

    this.root.addEventListener("start", event => {
      timeline.pause(); // 暂停时间线
      clearInterval(handler); // 清除 自动播放
      let progress = (Date.now() - t) / duration;
      ax = ease(progress) * 500 - 500; // 已经移到了下一帧 所以 -500
    })

    this.root.addEventListener("pan", event => {
      let x = event.clientX - event.startX - ax; // 拖拽的偏移需要减去动画产生的位移
      let current = position - ((x - x % 500) / 500);
      for (const offset of [-1, 0, 1]) {
          let pos = current + offset;
          pos = (pos % children.length + children.length) % children.length; // 这里不要出现负数
          children[pos].style.transition = 'none';
          children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + x % 500}px)`
      }

      // console.log(event.clientX);
    })

    this.root.addEventListener("end", event => {
      timeline.reset();
      timeline.start();
      handler = setInterval(nextPicture, 3000);

      // 校准位置
      let x = event.clientX - event.startX - ax; // 拖拽的偏移需要减去动画产生的位移
      let current = position - ((x - x % 500) / 500);

      let direction = Math.round((x % 500) / 500); // -1 0 1

      if(event.isFlick) {
        // console.log("velocity" + event.velocity);
        if(event.velocity > 0) {
          direction = Math.ceil((x % 500) / 500); // 上界
        } else {
          direction = Math.floor((x % 500) / 500); // 上界
        }
      }

      for (const offset of [-1, 0, 1]) {
          let pos = current + offset;
          pos = (pos % children.length + children.length) % children.length; // 这里不要出现负数
          children[pos].style.transition = 'none';
          timeline.add(new Animation(children[pos].style, "transform",
          -pos * 500 + offset * 500 + x % 500,
          -pos * 500 + offset * 500 + direction * 500,
          duration, 0, ease, v => `translateX(${v}px)`));
        }
        position = position - ((x - x % 500) / 500) - direction
        position = (position % children.length + children.length) % children.length;
    })

    let nextPicture = () => {
      let children = this.root.children;
      let nextIndex = (position + 1) % children.length;
      let current = children[position];
      let next = children[nextIndex];

      t = Date.now(); // 动画开始的事件

      timeline.add(new Animation(current.style, "transform",
        - position * 500, -500 - position * 500, duration, 0, ease, v => `translateX(${v}px)`));
      timeline.add(new Animation(next.style, "transform",
          500 - nextIndex * 500,  - nextIndex * 500,  duration, 0, ease, v => `translateX(${v}px)`));
      
      position = nextIndex;
      
    };
    handler = setInterval(nextPicture, 3000);

    /*
    this.root.addEventListener("mousedown", event => {
        let children = this.root.children;
        let startX = event.clientX;
        let move = (e) => {
            let x = e.clientX - startX;

            let current = position - ((x - x % 500) / 500);
            for (const offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos + children.length) % children.length;
                children[pos].style.transition = 'none';
                children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + x % 500}px)`
            }
        }

        let up = (e) => {
            let x = e.clientX - startX;
            position = (position - Math.round(x / 500) + children.length) % children.length;
            for (const offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
                let pos = position + offset;
                pos = (pos + children.length) % children.length;
                children[pos].style.transition = '';
                children[pos].style.transform = `translateX(${-pos * 500 + offset * 500}px)`

            }
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        }
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    })

    

    let currentIndex = 0;
    setInterval(() => {
      let children = this.root.children;
      let nextIndex = (currentIndex + 1) % children.length;
      let current = children[currentIndex];
      let next = children[nextIndex];
      next.style.transition = "none";
      next.style.transform = `translateX(${100 - nextIndex * 100}%)`
      setTimeout(() => {
        next.style.transition = "";
        current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
        next.style.transform = `translateX(${- nextIndex * 100}%)`;
        currentIndex = nextIndex;
      }, 16) // 16毫秒 浏览器里一帧的时间
      
    }, 3000)
  */

    return this.root;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
}