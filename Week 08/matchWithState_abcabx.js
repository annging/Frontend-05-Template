function match(string) {
    let state = start;
    for (let c of string) {
        state= state(c);
    }
    return state === end;
}

function start(c) {
    if (c === 'a') {
        return foundA;
    } else {
        return start;
    }
}

function foundA(c) {
    if (c === 'b') {
        return foundB;
    } else {
        return start(c);
    }
}

function foundB(c) {
    if (c === 'c') {
        return foundC;
    } else {
        return start(c);
    }
}

function foundC(c) {
    if (c === 'a') {
        return foundCA;
    } else {
        return start(c);
    }
}

function foundCA(c) {
    if (c === 'b') {
        return foundCB;
    } else {
        return start(c);
    }
}

function foundCB(c) {
    if (c === 'x') {
        return end;
    } else  {
        return foundB(c);
    }
}

function end(c) {
    return end;
}

console.log(match("Look at me, abcabx! Look at me on my bike!"));