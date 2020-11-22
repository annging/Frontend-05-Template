function StringToNumber(string, radix) {
    if (typeof string !== 'string' && typeof srting !== 'number') {
        return NaN;
    }

    if (radix && (typeof radix !== 'number' || !/[2|8|10|16]/.test(radix))) {
        console.log('只支持2进制 8进制 10进制 16进制');
        return NaN;
    }

    let rexp = 
        radix == 10 ? /(-?)([0]?)([0-9]+)/ : /(-?)([0]?[Xx]?)([0-9a-fA-F]+)/,
        a = string.match(rexp),
        sign = a[1],
        rawRadix = a[2],
        rawNum = a[3],
        result = 0,
        strArr = rawNum.split(''),
        len = strArr.length,
        numArr = [];
    
    // console.log(a);

    if (a && !radix) {
        if (rawRadix.toUpperCase() === '0X') {
            radix = 16;
        } else if (rawRadix === '0') {
            radix = 8;
        } else {
            radix = 10;
        }
    }

    for (let i = 0; i < len; i++) {
        let num;
        let charCode = strArr[i].toUpperCase().charCodeAt(0);

        if (radix <= 36 && radix >= 11) {
            if (charCode >= 65 && charCode <= 90) {
                num = charCode - 55;
            } else {
                num = charCode - 48;
            }
        } else {
            num = charCode - 48;
        }

        if (num < radix) {
            numArr.push(num);
        } else {
            return NaN;
        }
    }

    if (numArr.length > 0) {
        numArr.forEach(
            (item, j) =>
                (result += item * Math.pow(radix, numArr.length - j - 1))
        );
    }

    if (sign === '-') result = -result;

    return result;

}

console.log(StringToNumber('F', 16));
console.log(StringToNumber('17', 8));
console.log(StringToNumber('15', 10));
console.log(StringToNumber(15.99, 10));
console.log(StringToNumber('FXX123', 16));