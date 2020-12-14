const { timeStamp } = require("console");
const net = require("net");
const { resolve } = require("path");
const { send } = require("process");

var images = require("images");

const parser = require("./parser.js");
const render = require('./render.js');

class Request {
    constructor(options) {
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || "/";
        this.body = options.body || {};
        this.headers = options.headers || {};
        // http协议中header 一定要有 Content-Type的，否则body解析不了
        if(!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        // body 有4种常见的编码格式，下面解析2种
        if(this.headers["Content-Type"] === "application/json") {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers["Content-Type"] === "application/x-www-form-urlencoded") {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join("&");
        }
        // Content-Length 如果传的不对 会是非法协议，所以这里不建议外传。
        this.headers['Content-Length'] = this.bodyText.length;
    }

    // connection 有连接，没有就创建一个新连接
    send(connection) {
        return new Promise((resolve, reject) => {
            // 因为这里会逐步收到信息？ 所以设计一个parser。
            const parser = new ResponseParser;
            // 有连接 或者无连接
            if (connection) {
                connection.write(this.toString());
            } else {
                connection =  net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                })
            }
            // 监听 data
            connection.on('data', (data) => {
                // console.log(data.toString());

                // 把data转换为字符串，传给parser
                parser.receive(data.toString());

                // parser 结束
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
                connection.end();
            });
            // 遇到错误
            connection.on('error', (err) => {
                reject(err);
                // 释放连接
                connection.end();
            })
        })
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }
}

// 逐步接收response的文本
class ResponseParser {
    constructor() {
        // if区分常量     状态机有很多种实现方法  这里可以把常量的写法改成函数的
        this.WAITING_STATUS_LINE = 0; // /r
        this.WAITING_STATUS_LINE_END = 1; // /n

        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;

        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;

    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    // 状态机
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
                // 因为body跟header相关，所以在header结束的时候,根据header中Transfer-Encoding的值来创建bodyParser
                if (this.headers['Transfer-Encoding'] === 'chunked') { // node中是chunked 其他的值没加上
                    this.bodyParser = new TrunkedBodyParser();
                }

            } else {
                this.headerName += char;
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === " ") {
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] =  this.headerValue;
                this.headerName = "";
                this.headerValue = "";
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY;
            }
        } else if (this.current === this.WAITING_BODY) {
            // console.log(char);
            this.bodyParser.receiveChar(char);
        }
    }
}

class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2; // 不是米利状态机？ trunk 中可能有任何字符。
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;

        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.currentStatus = this.WAITING_LENGTH;
    }

    receiveChar(char) {
        if (this.currentStatus === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                this.currentStatus = this.WAITING_LENGTH_LINE_END;
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.currentStatus === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.currentStatus = this.READING_TRUNK;
            }
        } else if (this.currentStatus === this.READING_TRUNK) {
            this.content.push(char);
            this.length --;
            if (this.length === 0) {
                this.currentStatus = this.WAITING_NEW_LINE;
            }
        } else if (this.currentStatus === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.currentStatus = this.WAITING_NEW_LINE_END;
            }
        } else if (this.currentStatus === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.currentStatus = this.WAITING_LENGTH;
            }
        }
    }
}

// 在使用立即执行的函数表达式时，可以利用 void 运算符让 JavaScript 引擎把一个function关键字识别成函数表达式而不是函数声明（语句）。
void async function() {
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: "8088",
        path: "/",
        headers: {
            ["X-Foo2"]: "customed"
        },
        body: {
            name: "Ivy"
        }
    });

    let response = await request.send();
    // console.log(response);

    let dom = parser.parseHTML(response.body); // 真正的浏览器这里要异步分段处理body
    let viewport = images(800, 600);

    render(viewport, dom);

    viewport.save('./Week 10/toy-browser/viewport.jpg')

}();