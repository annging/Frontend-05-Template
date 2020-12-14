function getStyle(element) {
	if (!element.style) element.style = {};

	for (let prop in element.computedStyle) {
		var p = element.computedStyle.value;
		element.style[prop] = element.computedStyle[prop].value;

		if (element.style[prop].toString().match(/px$/)) {
			element.style[prop] = parseInt(element.style[prop]);
		}
		if (element.style[prop].toString().match(/^[0-9\.]$/)) {
			element.style[prop] = parseInt(element.style[prop]);
		}
	}
	return element.style;
}

function layout(element) {
	if (!element.computedStyle) return;

	var style = getStyle(element);
	console.log(style);

	if (style.display !== "flex")
		//ToyBrowser 只处理flex排版，忽略其他排版格式
		return;

	var items = element.children.filter((item) => item.type === "element");

	items
		.sort((a, b) => (a.order || 0) - (b.order || 0))

		[("width", "height")].forEach((size) => {
			if (style[size] === "" || style[size] === "auto") {
				style[size] = null;
			}
		});

	if (!style.flexDirection || style.flexDirection === "auto") style.flexDirection = "row";

	if (!style.alignItems || style.alignItems === "auto") style.alignItems = "stretch";

	if (!style.justifyContent || style.justifyContent === "auto") style.justifyContent = "flex-start";

	if (!style.flexWrap || style.flexWrap === "auto") {
		style.flexWrap = "nowrap";
	}

	if (!style.alignContent || style.alignContent === "auto") style.alignContent = "stretch";

	let mainSize, mainStart, mainEnd, mainSign, mainBase;
	crossSize, crossStart, crossEnd, crossSign, crossBase;

	if (style.flexDirection === "row") {
		mainSize = "width";
		mainStart = "left";
		mainEnd = "right";
		mainSign = +1;
		mainBase = 0;

		crossSize = "height";
		crossStart = "top";
		crossEnd = "bottom";
	}

	if (style.flexDirection === "row-reverse") {
		mainSize = "width";
		mainStart = "right";
		mainEnd = "left";
		mainSign = -1;
		mainBase = style.width;

		crossSize = "height";
		crossStart = "top";
		crossEnd = "bottom";
	}

	if (style.flexDirection === "column") {
		mainSize = "height";
		mainStart = "top";
		mainEnd = "bottom";
		mainSign = +1;
		mainBase = 0;

		crossSize = "width";
		crossStart = "left";
		crossEnd = "right";
	}

	if (style.flexWrap === "wrap-reverse") {
		let tmp = crossStart;
		crossStart = crossEnd;
		crossEnd = tmp;
		crossSign = -1;
	} else {
		crossBase = 0;
		crossSign = 1;
	}

	/**
	 *
	 *** 把元素收进行
	 *
	 **/

	let isAutoMainSize = false;
	if (!style[mainSize]) {
		style[mainSize] = 0;
		for (let i = 0; i < items.length; i++) {
			let itemStyle = item[i].style;
			if (itemStyle[mainSize] != null && itemStyle[mainSize] != "")
				style[mainSize] = style[mainSize] + itemStyle[mainSize];
		}
		isAutoMainSize = true;
	}

	let flexLine = [];
	let flexLines = [flexLine];
	var mainSpace = style[mainSize];
	var crossSpace = 0;

	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		var itemStyle = getStyle(item);
		if (itemStyle[mainSize] == null) itemStyle[mainSize] = 0;

		if (itemStyle.flex) {
			flexLine.push(item);
		} else if (style.flexWrap === "nowrap" && isAutoMainSize) {
			mainSpace -= itemStyle[mainSize];
			if (item[crossSize] !== null && item[crossSize] !== void 0)
				crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
			flexLine.push(item);
		} else {
			if (itemStyle[mainSize] > item[mainSize]) itemStyle[mainSize] = item[mainSize];
			if (mainSpace < item[mainSize]) {
				flexLine.mainSpace = mainSpace;
				flexLine.crossSpace = crossSpace;
				flexLine = [item];
				flexLines.push(flexLine);
				mainSpace = style[mainSize];
				crossSpace = 0;
			} else {
				flexLine.push(item);
			}
			if (item[crossSize] !== null && item[crossSize] !== void 0)
				crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
			mainSpace -= itemStyle[mainSize];
		}
	}
	flexLine.mainSpace = mainSpace;
	//console.log(items);

	/**
	 *
	 * 计算主轴尺寸
	 *
	 **/
	if (style.crossSpace === "nowrap" || isAutoMainSize) {
		flexLine.crossSpace = style[crossSize] !== undefined ? style[crossSize] : crossSpace;
	} else {
		flexLine.crossSpace = crossSpace;
	}

	if (mainSpace < 0) {
		//只有当容器只有一行时(style.flexWrap = "nowrap";)
		let scale = style[mainSize] / style[mainSize] - style[mainSpace];

		let currentMain = mainBase;
		for (let i = 0; i < item.length; i++) {
			var item = item[i];
			itemStyle = getStyle(item);
			if (itemStyle.flex) {
				itemStyle[mainSize] = 0;
			}

			itemStyle[mainSize] = itemStyle[mainSize] * scale;

			itemStyle[mainStart] = currentMain;
			itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
			currentMain = itemStyle[mainEnd];
		}
	} else {
		flexLines.forEach(function (items) {
			let mainSpace = items.mainSpace;
			let flexTotal = 0;
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				let itemStyle = getStyle(item);

				if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
					flexTotal += itemStyle.flex;
					continue;
				}
			}

			if (flexTotal > 0) {
				let currentMain = currentBase;
				for (let i = 0; i < items.length; i++) {
					let item = items[i];
					let itemStyle = getStyle(item);

					if (itemStyle.flex) {
						itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
					}
					itemStyle[mainStart] = currentMain;
					itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
					currentMain = itemStyle[mainEnd];
				}
			} else {
				//there is no flexible flex item, which means, justifyContent should work
				if (style.justifyContent === "flex-start") {
					let currentMain = mainBase;
					let step = 0;
				}
				if (style.justifyContent === "flex-end") {
					let currentMain = mainSpace + mainSign * mainBase;
					let step = 0;
				}
				if (style.justifyContent === "center") {
					let currentMain = (mainSpace / 2) * mainSign + mainBase;
					let step = 0;
				}
				if (style.justifyContent === "space-between") {
					let step = (mainSpace / (items.length - 1)) * mainSign;
					let currentMain = mainBase;
				}
				if (style.justifyContent === "space-around") {
					let step = (mainSpace / items.length) * mainSign;
					let currentMain = step / 2 + mainBase;
				}

				for (let i = 0; i < items.length; i++) {
					let item = item[i];
					itemStyle[mainStart] = currentMain;
					itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
					currentMain = itemStyle[mainEnd] + step;
				}
			}
		});
	}
	/**
	 *
	 * 计算交叉轴尺寸
	 * align-item    align-self
	 **/
	if (!style[crossSize]) {
		//auto sizing
		crossSpace = 0;
		elementStyle[crossSize] = 0;

		for (let i = 0; i < flexLines.length; i++) {
			elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
		}
	} else {
		crossSpace = style[crossSize];
		for (let i = 0; i < flexLines.length; i++) {
			crossSpace -= flexLines[i].crossSpace;
		}

		if (style.flexWrap === "wrap-reverse") {
			crossBase = style[crossSize];
		} else {
			crossBase = 0;
		}
		let lineSize = style[crossSize] / flexLines.length;

		let step;
		if (style.alignContent === "flex-start") {
			crossBase = 0;
			step = 0;
		}
		if (style.alignContent === "flex-end") {
			crossBase += crossSign * crossSpace;
			step = 0;
		}
		if (style.alignContent === "center") {
			crossBase += (crossSign * crossSpace) / 2;
			step = 0;
		}
		if (style.alignContent === "space-between") {
			crossBase += 0;
			step = crossSpace / (flexLines.length - 1);
		}
		if (style.alignContent === "space-around") {
			step = crossSpace / flexLines.length;
			crossBase += (crossSign * step) / 2;
		}
		if (style.alignContent === "stretch") {
			step = 0;
			crossBase += 0;
		}

		flexLines.forEach(function (item) {
			let lineCrossSize =
				style.alignContent === "stretch"
					? items.crossSpace + crossSpace / flexLines.length
					: items.crossSpace;

			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				let itemStyle = getStyle(item);

				let align = itemStyle.alignSelf || style.alignItems;

				if (itemStyle[crossSize] === null) {
					itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
				}

				if (align === "flex-start") {
					itemStyle[crossStart] = crossBase;
					itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
				}

				if (align === "flex-end") {
					itemStyle[crossStart] = crossBase;
					itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
				}

				if (align === "center") {
					itemStyle[crossStart] =
						crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
					itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
				}

				if (align === "stretch") {
					itemStyle[crossStart] = crossBase;
					itemStyle[crossEnd] =
						crossBase +
						crossSign * (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
							? itemStyle[crossSize]
							: lineCrossSize;
					itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
				}
			}
			crossBase += crossSign * (lineCrossSize + step);
		});
	}
}

module.exports = layout;