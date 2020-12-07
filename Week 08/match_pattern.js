// https://zh.wikipedia.org/wiki/Boyer-Moore%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%90%9C%E7%B4%A2%E7%AE%97%E6%B3%95

function match(T, P) {
    let state = start;
    let m = 0; // m代表主文字符串S内匹配字符串W的当前查找位置
    let i = 0; // i代表匹配字符串W当前做比较的字符位置。

    return state === end;
}


function end(c) {
    return end;
}

console.log(match("Look at me, abababxabx! Look at me on my bike!"));