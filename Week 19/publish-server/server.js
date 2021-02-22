let http = require('http');
let https = require('https');
let fs = require('fs');
let unzipper = require('unzipper');
let querystring = require('querystring');

// 2. auth路由：接收code,用client_id client_secret code 换取token
function auth(request, response) {
    let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/)[1]); // [\s\S]表示完全通配  [\s]表示，只要出现空白就匹配 [\S]表示，非空白就匹配
    // console.log(query);
    getToken(query.code, function(info) {
        // response.write(JSON.stringify(info));
        response.write(`<a href="http://localhost:8083/?token=${info.access_token}">publish</a>`)
        console.log(info);
        response.end();
    });
}

function getToken(code, callback) {
    let request = https.request({
        hostname: "github.com",
        path: `/login/oauth/access_token?code=${code}&client_id=Iv1.01e505fd91aa2f40&client_secret=6ed31b08c2ba20a50743a049e86b12475581eec6`,
        port: 443, // ?
        method: "POST"
    }, function(response) {
        // console.log(response);
        // 用流的方式处理response
        let body = "";
        response.on("data", chunk => {
            console.log(chunk.toString());
            body += chunk.toString();
        })
        response.on("end", () => {
            // console.log(body);
            callback(querystring.parse(body))
        })
    });
    request.end();
}


// 4 publish路由：用token获取用户信息，检查权限，接受发布
function publish(request, response) {
    let query = querystring.parse(request.url.match(/^\/publish\?([\s\S]+)$/)[1]); // 服务器拿到token

    getUser(query.token, info => {
        if (info.login === "annging") { // 这里其实需要做权限系统
            request.pipe(unzipper.Extract({ path: '../server/public/' }));
            request.on("end", () => {
                response.end("success");
            })
        }
    });
    
}
function getUser(token, callback) {
    let request = https.request({
        hostname: "api.github.com",
        path: `/user`,
        port: 443, // ?
        method: "GET",
        headers: { // 有时候提示少东西，也可能是headers写错了
            Authorization: `token ${token}`,
            "User-Agent": 'try-publish'
        }
    }, function(response) {
        // console.log(response);
        // 用流的方式处理response
        let body = "";
        response.on("data", chunk => {
            console.log(chunk.toString());
            body += chunk.toString();
        })
        response.on("end", () => {
            // console.log(body);
            callback(JSON.parse(body))
        })
    });
    request.end();
}

// 启动server
http.createServer(function(request, response) {
    // 检查url判断路由
    if (request.url.match(/^\/auth\?/)) {
        return auth(request, response);
    }
    if (request.url.match(/^\/publish\?/)) {
        return publish(request, response);
    }
    // console.log("request");
    // let outFile = fs.createWriteStream("../server/public/tmp.zip");
    // request.pipe(outFile);
    // request.pipe(unzipper.Extract({ path: '../server/public/' })); // 覆盖式发布

}).listen(8082);