let http = require('http');
let fs = require('fs');
let archiver = require('archiver');
let child_process = require('child_process');
let querystring = require('querystring');

// 1 GET https://github.com/login/oauth/authorize
child_process.exec(`start https://github.com/login/oauth/authorize?client_id=Iv1.01e505fd91aa2f40`);

// 3 创建server 接受token 然后点击发布
http.createServer(function(request, response) {
    let query = querystring.parse(request.url.match(/^\/\?([\s\S]+)$/)[1]); // 拿到token
    publish(query.token); // 发送 publish 请求
}).listen(8083);

function publish(token) {
    let request = http.request({
        hostname: "127.0.0.1",
        port: "8082",
        method: "POST",
        path: "/publish?token=" + token,
        headers: {
            "Content-Type": "application/octet-stream"
        }
    }, response => {
        console.log(response);
    });
    
    // let file = fs.createReadStream("./sample.html");
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    
    archive.directory('./sample/', false);
    
    archive.finalize();
    
    // archive.pipe(fs.createWriteStream("tmp.zip"));
    archive.pipe(request);
}


