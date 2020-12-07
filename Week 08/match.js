/**
 * function matchA 匹配一个字符串中的 'a'
 * @param {*} string 
 */
function matchA(string) {
    for (let s of string) {
        if (s === 'a') {
            return true;
        }
    }
    return false;
}

/**
 * function matchAB 匹配一个字符串中的 'ab'
 * @param {*} string 
 */
function matchAB(string) {
    for (let i = 0; i < string.length; i++ ) {
        let s = string.charAt(i);
        let t = string.charAt(i + 1);
        if (s === 'a' && t === 'b' ) {
            return true;
        } 
    }
    return false;
}


/**
 * function matchAB2 匹配一个字符串中的 'ab'
 * @param {*} string 
 */
function matchAB2(string) {
    let foundA = false;
    for (let c of string) {
        if (c === 'a') {
            foundA =  true;
        } else if (foundA && c === 'b') {
            return true;
        } else {
            foundA = false;
        }
    }
    return false;
}


/**
 * function matchABCDEF 匹配一个字符串中的 'abcdef'
 * @param {*} string 
 */
function matchABCDEF(string) {
    let foundA = false;
    let foundB = false;
    let foundC = false;
    let foundD = false;
    let foundE = false;
    for (let c of string) {
        if (c === 'a') {
            foundA =  true;
        } else if (foundA && !foundB && c === 'b') {
            foundB = true;
        } else if (foundB && !foundC && c === 'c') {
            foundC = true;
        } else if (foundB && !foundD && c === 'd') {
            foundD = true;
        } else if (foundD && !foundE && c === 'e') {
            foundE = true;
        } else if (foundE && !foundE && c === 'f') {
            return true;
        } else {
            foundA = false;
            foundB = false;
            foundC = false;
            foundD = false;
            foundE = false;
        }
    }
    return false;
}

function matchABCDEF2(string) {
    for (let i = 0; i < string.length; i++ ) {
        let s = string.charAt(i);
        let t = string.slice(i, i + 6);
        if (t === 'abcdef' ) {
            return true;
        } 
    }
    return false;
}


console.log(matchABCDEF2("Look at me, abcdef! Look at me on my bike!"));