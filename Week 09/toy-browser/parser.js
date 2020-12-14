const css = require('css');

const EOF = Symbol("EOF"); // EOF 文件结束
let currentToken = null; // tag是当作一个token去处理的
let currentAttribute = null;
let currentTextNode = null;

let stack = [{type: "document", children: []}];


//addCSSRules 把 CSS规则暂存到一个数组里
let rules = [];
function addCSSRules(text) {
    var ast = css.parse(text);
    // console.log(JSON.stringify(ast, null, '    '));
    rules.push(...ast.stylesheet.rules);
    console.log(rules);
}

// 这里 selector是简单选择器 .me #me div
function match(element, selector) {
    if(!selector || !element.attributes) {
        return false
    }

    if (selector.charAt(0) === '#') {
        var attr = element.attributes.filter(attr => attr.name === 'id')
        if (attr && attr.value === selector.replace('#', '')) {
            return true
        }
    } else if(selector.charAt(0) === '.') {
        var attr = element.attributes.filter(attr => attr.name === 'class')
        if (attr && attr.value === selector.replace('.', '')) {
            return true
        }
    } else {
        if (element.tagName === selector) {
            return true
        }
    }
    return false
}

// 计算优先级
function specificity(selector) {
    var p = [0,0,0,0]
    var selectorParts = selector.split(" ")
    for(var part of selectorParts) {
        if(part.charAt(0) === '#') {
            p[1] += 1
        } else if(part.charAt(0) === '.') {
            p[2] += 1
        } else {
            p[3] += 1
        }
    }
    return p
}

// 比较优先级
function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    }
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    }
    return sp1[3] - sp2[3]
}


function computeCSS(element) {
    // console.log(rules);
    // console.log("计算" + element + "属性");

    // 获取父元素序列
    var elements = stack.slice().reverse(); // slice()不传参数复制数组， reverse()用在这里是因为 标签匹配是从当前元素从外匹配。
    if (!element.computeStyle) {
        element.computeStyle = {}
    }
    for (let rule of rules) {
        // 不考虑 ,
        var selectorParts = rule.selectors[0].split(" ").reverse();

        if (!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;

        var j = 1; // 当前选择器的位置
        // i 当前元素的位置
        for (var i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        if(j >= selectorParts.length) {
            matched = true;
        }
        if (matched) {
            // 匹配到
            /*var computeStyle = element.computeStyle;
            for (var declaration of rule.declarations) {
                if (!computeStyle[declaration.property]) {
                    computeStyle[declaration.property] = {}
                }
                computeStyle[declaration.property].value = declaration.value;
            }
            // console.log("element", element, "匹配", rule);
            console.log(element.computeStyle);*/

            // 计算优先级
            var sp = specificity(rule.selectors[0])
            var computedStyle = element.computedStyle
            for(var declaration of rule.declarations) {
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                }
                if(!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                } else if(compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
            }
        }
    }
}

function emit(token) {
    // console.log(token);
    let top = stack[stack.length -1];
    if (token.type === "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        };
        element.tagName = token.tagName;

        for (let p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        computeCSS(element);

        top.children.push(element);
        element.parent = top;

        if (!token.isSelfClosing) {
            stack.push(element);
        }
        currentTextNode = null;
    } else if (token.type === "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("标签的开始和结束不匹配");
        } else {
            if (top.tagName === "style") {
                addCSSRules(top.children[0].content);
            }
            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type === "textNode") {
        if (currentTextNode == null) {
            currentTextNode = {
                type: "textNode",
                content: ""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

function data(c) {
    if (c === "<") {
        return tagOpen; // 标签开始
    } else if (c === EOF) {
        emit({
            type: "EOF"
        });
        return ;
    } else {
        emit({
            type: "textNode",
            content: c
        }); // 逐个emit，后面会构建构造树
        return data;
    }
}

function tagOpen(c) {
    if (c === "/") {
        return endTagOpen; // 结束标签开始
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c); //收集tagName
    } else {
        return ;
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c);
    } else if (c == ">") {
        console.log("err");
    } else if (c == EOF) {
        console.log("err");
    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName; // 开始属性
    } else if (c === "/") {
        return selfClosingStartTag; // 自封闭标签
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === ">") {
        emit(currentToken);
        return data; // 普通的开始标签
    } else {
        return tagName;
    }
}


function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName; 
    } else if (c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c);
    } else if (c === "=") {
        console.log("err");
    } else {
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c === "/" || c === EOF) {
        return afterAttributeName(c);
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c == "\u0000") {

    } else if (c === "\"" || c === "'" || c === "<") {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}


function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName(c);
    } else if (c === "/") {
        return selfClosingStartTag;
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {
    
    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: "",
        }
        return attributeName(c);
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
        return beforeAttributeValue;
    } else if (c === "\"") {
        return doubleQuotedAttributeValue;
    } else if (c === "\'") {
        return singleQuotedAttributeValue;
    } else if (c === ">") {
        // err
    } else {
        return UnquotedAttributeValue(c); // 啥也没有
    }
}



function doubleQuotedAttributeValue(c) {
    if (c === "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {

    } else if (c ===EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if (c === "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {

    } else if (c ===EOF) {

    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function UnquotedAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if(c === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if(c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if(c === '\u0000') {

    } else if (c === "\"" || c === "," || c === "=" || c === "`") {

    } else if(c === EOF) {

    } else {
        currentAttribute.value += c
        return UnquotedAttributeValue
    }
}

function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(c === "/"){
        return selfClosingStartTag;
    }else if(c === '>'){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data
    }else if(c === EOF){
        // 错误
    }else{
        currentAttribute.value += c;
        return beforeAttributeName(c);
    }
}

function selfClosingStartTag(c) {
    if (c == ">") {
        currentToken.isSelfClosing = true;
        return data;
    } else if (c == "EOF") {
        console.log("err")
    } else {
        console.log("err");
    }
}

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
    console.log(stack[0]);
}