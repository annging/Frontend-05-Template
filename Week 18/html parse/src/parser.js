// 创建元素
// 三种标签类型： <span> </span> <br/>


let stack = [{ type: "document", children: [] }];

let currentToken = {};
let currentAttr = {};
let currentTextNode = {};

function emitToken(token) {
	// console.log(token)
	let top = stack[stack.length - 1];
	if (token.type === "startTag") {
		let element = {
			type: "element",
			children: [],
			attributes: [],
		};
		element.tagName = token.tagName;
		for (const p in token) {
			if (p != "tagName" && p != "type") {
				element.attributes.push({
					name: p,
					value: token[p],
				});
			}
		}

		top.children.push(element);
		// element.parent = top;
		if (!token.isSelfClosing) {
			stack.push(element);
		}
		currentTextNode = null;
	} else if (token.type === "endTag") {
		if (top.tagName !== token.tagName) {
			throw new Error("Tag start and end doesn't match");
		} else {
			stack.pop();
		}
		currentTextNode = null;
	} else if (token.type === "text") {
		if (currentTextNode == null) {
			currentTextNode = {
				type: "element",
				content: "",
			};
			top.children.push(currentTextNode);
		}

		currentTextNode.content += token.content;
	}
}

const EOF = Symbol("EOF"); //EOF: End Of File

function data(c) {
	if (c === "<") {
		return tagOpen;
	} else if (c === EOF) {
		emitToken({
			type: "EOF",
		});
		return;
	} else {
		emitToken({
			type: "text",
			content: c,
		});
		return data;
	}
}

function tagOpen(c) {
	if (c === "/") {
		return endTagOpen;
	} else if (c.match(/^[a-zA-z]$/)) {
		currentToken = {
			type: "startTag",
			tagName: "",
		};
		return tagName(c);
	} else {
		return;
	}
}

function endTagOpen(c) {
	if (c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			type: "endTag",
			tagName: "",
		};
		return tagName(c);
	} else if (c === ">") {
		//error
	} else if (c === EOF) {
		//error
	} else {
	}
}

function tagName(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName;
	} else if (c === "/") {
		return selfClosingStartTag;
	} else if (c === ">") {
		emitToken(currentToken);
		return data;
	} else if (c.match(/^[a-zA-Z]$/)) {
		currentToken.tagName += c;
		return tagName;
	} else {
		return tagName;
	}
}

function beforeAttributeName(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName;
	} else if (c == ">" || c == "/" || c == EOF) {
		return afterAttributeName(c);
		return data;
	} else if (c == "=") {
		return beforeAttributeName;
	} else {
		currentAttr = {
			name: "",
			value: "",
		};
		return attributeName(c);
	}
}

function afterAttributeName(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		return afterAttributeName;
	} else if (c == "/") {
		return selfClosingStartTag;
	} else if (c == "=") {
		return beforeAttributeValue;
	} else if (c == ">") {
		currentToken[currentAttr.name] = currentAttr.value;
		emit(currentToken);
		return data;
	} else if (c == EOF) {
	} else {
		currentToken[currentAttr.name] = currentAttr.value;
		currentAttr = {
			name: "",
			value: "",
		};
		return attributeName(c);
	}
}

function attributeName(c) {
	if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
		return afterAttributeName(c);
	} else if (c == "=") {
		return beforeAttrbuteValue;
	} else if (c == "\u0000") {
	} else if (c == '"' || c == "'" || c == "<") {
	} else {
		currentAttr.name += c;
		return attributeName;
	}
}

function beforeAttrbuteValue(c) {
	if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
		return beforeAttrbuteValue;
	} else if (c == '"') {
		return doubleQuotedAttrValue;
	} else if (c == "'") {
		return singleQuotedAttrValue;
	} else if (c == ">") {
	} else {
		return unQuotedAttrValue(c);
	}
}

function afterQuotedAttributeValue(c) {
	if (c.match(/^[\t\n\t ]$/)) {
		return beforeAttributeName;
	} else if (c == "/") {
		return selfClosingStartTag;
	} else if (c == ">") {
		currentToken[currentAttr.name] = currentAttr.value;
		emitToken(currentToken);
		return data;
	} else if (c == EOF) {
	} else {
		currentAttr.value += c;
		return doubleQuotedAttrValue;
	}
}

function doubleQuotedAttrValue(c) {
	if (c == '"') {
		currentToken[currentAttr.name] = currentAttr.value;
		return afterQuotedAttributeValue;
	} else if (c == "\u0000") {
	} else if (c == EOF) {
	} else {
		currentAttr.value += c;
		return doubleQuotedAttrValue;
	}
}

function singleQuotedAttrValue(c) {
	if (c == "'") {
		currentToken[currentAttr.name] = currentAttr.value;
		return afterQuotedAttributeValue;
	} else if (c == "\u0000") {
	} else if (c == EOF) {
	} else {
		currentAttr.value += c;
		return singleQuotedAttrValue;
	}
}

function unQuotedAttrValue(c) {
	if (c.match(/^[\t\n\t ]$/)) {
		currentToken[currentAttr.name] = currentAttr.value;
		return beforeAttributeName;
	} else if (c == "/") {
		currentToken[currentAttr.name] = currentAttr.value;
		return selfClosingStartTag;
	} else if (c == ">") {
		currentToken[currentAttr.name] = currentAttr.value;
		emitToken(currentToken);
		return data;
	} else if (c == "\u0000") {
	} else if (c == '"' || c == "'" || c == "<" || c == "=" || c == "`") {
	} else if (c == EOF) {
	} else {
		currentAttr.value += c;
		return unQuotedAttrValue;
	}
}

function selfClosingStartTag(c) {
	if (c == ">") {
		currentToken.isSelfClosing = true;
		emitToken(currentToken);
		return data;
	} else if (c == EOF) {
	} else {
	}
}

module.exports.parseHTML = function parseHTML(html) {
	console.log(html);
	let state = data;
	for (let c of html) {
		state = state(c);
	}

	state = state(EOF);
	// console.log('stack',stack)
	return stack[0];
};