const images = require('images');

function render(viewport, element) {
	console.log(element);
	if (element.style) {
		let img = images(element.style.width || 100, element.style.height || 100);

		if (element.style["background-color"]) {
			let color = element.style["background-color"] || "rgb(0,0,0)";
			console.log("color:", color);
			color.match(/rgb\((\d+),(\d+),(\d+)\)/);
			img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3), 1);
			viewport.draw(img, element.style.left || 0, element.style.top || 0);
        }
    }

    if (element.children) {
        for (let child of element.children) {
            render(viewport, child);
        }
    }
	
}

module.exports = render;