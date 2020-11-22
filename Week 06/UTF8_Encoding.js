function UTF8_Encodeing(string) {
    let codeList = [];
    for (const str of string) {
        let code = str.charCodeAt(0); // Unicode UTF16
        //console.log(code);
        // console.log(code.toString(2)); // code对应的二进制
        //根据code的大小判断UTF8的长度
        if (code > 0x0 && code <= 0x7f) { //单字节   UTF-16 0000 - 007F      UTF-8  0xxxxxxx
			codeList.push(code);
		} else if (code >= 0x80 && code <= 0x7ff){ //双字节  UTF-16 0080 - 07FF       UTF-8  110xxxxx 10xxxxxx
			codeList.push(
				//110xxxxx
				0xc0 | ((code >> 6) & 0x1f),
				//10xxxxxx
				0x80 | (code & 0x3f)
		    );
		} else if (code >= 0x800 && code <= 0xd7ff || code >= 0xe000 && code <= 0xffff){ //三字节  UTF-16 0800 - FFFF         UTF-8  1110xxxx 10xxxxxx 10xxxxxx
			codeList.push(
				//1110xxxx
				0xe0 | ((code >> 12) & 0xf),
				//10xxxxxx
				0x80 | ((code >> 6) & 0x3f),
				//10xxxxxx
				0x80 | (code & 0x3f)
            );
        }

    }
    return codeList;
}

 let code = UTF8_Encodeing('你好');
console.log(code);