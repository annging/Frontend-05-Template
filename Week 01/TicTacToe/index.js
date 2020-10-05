let pattern = [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
];

let color = 1;

//绘制棋盘
function show() {
    let board = document.getElementById("board");
    board.innerHTML = "";

    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText =
                pattern[i * 3 + j] == 2 ? "❌" :
                pattern[i * 3 + j] == 1 ? "⭕" : "";
            board.appendChild(cell);
            cell.addEventListener("click", () => userMove(i, j));
        }
        board.appendChild(document.createElement("br"));
    }
}

function userMove(x, y) {
    pattern[x * 3 + y] = color;
    
    show();
    if(check(pattern, color)) {
        alert(color == 2 ? "❌ win" : "⭕ win");
        return false;
    }
    color = 3 - color;
    computerMove();
}

function computerMove() {
    let choice = bestChoice(pattern, color);
    if(choice.point) {
        pattern[choice.point[1] * 3 + choice.point[0]] = color;
    }
    if(check(pattern, color)) {
        alert(color == 2 ? "❌ win" : "⭕ win");
    }
    color = 3 - color;
    console.log(bestChoice(pattern, color));
    show();
}

function check(pattern, color) {
    // 行
    for(let i = 0; i < 3; i++) {
        let win = true;
        for(let j = 0; j < 3; j++) {
            if(pattern[i * 3 + j] !== color) {
                win = false;
            }
        }
        if(win) {
            return true;
        }
    }

    //列
    for(let i = 0; i < 3; i++) {
        let win = true;
        for(let j = 0; j < 3; j++) {
            if(pattern[3 * j + i] !== color) {
                win = false;
            }
        }
        if(win) {
            return true;
        }
    }

    //斜线
    {
        let win = true;
        for(let j = 0; j < 3; j++) {
            if(pattern[j * 3 + j] !== color) {
                win = false;
            }
        }
        if(win) {
            return true;
        }
    }
    {
        let win = true;
        for(let j = 0; j < 3; j++) {
            if(pattern[j * 3 + 2 - j] !== color) {
                win = false;
            }
        }
        if(win) {
            return true;
        }
    }
}

function clone(pattern) {
    return Object.create(pattern);
}

function willWin(pattern, color) {
    for(let i = 0; i < 3; i++) {
        for(let j =0; j < 3; j++) {
            if(pattern[i * 3 + j]) continue;
            let temp = clone(pattern);
            temp[i * 3 + j] = color;
            if(check(temp, color)) {
                return [j, i];
            }
        }
    }
    return null;

}

function bestChoice(pattern, color) {
    let p;
    if(p = willWin(pattern, color)) {
        return {
            point: p,
            result: 1
        }
    }
    let result = -2; // -1 输 1赢 0和
    let point = null;
    outer:for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            if(pattern[i * 3 + j]) continue;
            let temp = clone(pattern);
            temp[i * 3 + j] = color;
            let r = bestChoice(temp, 3-color).result;

            if(-r > result) {
                result = -r;
                point = [j, i];
            }
            if(result == 1) {
                break outer;
            }
        }
    }
    return {
        point: point,
        result: result ? result : 0
    }
}

show(pattern);
console.log(bestChoice(pattern, color));