const { Console } = require('console');
const http = require('http');

http.createServer((request, response) => {
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        // body.push(chunk.toString());
        body.push(chunk);
        console.log("body:" + body);
    }).on('end', () => {
        body = Buffer.concat(body).toString();  // https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/#request-body
        // at this point, `body` has the entire request body stored in it as a string

        console.log("body:", body);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(
`<html matt="abv">
<head>
<style>
div div .me {
    background-color: red;
}</style>
</head>
<body>
<div>
<div class="me">toy</div>
<div>
<div class="me">toy, browser.</div>
</div>
</div>
</body>
</html>`);
        console.log("server end");
    })
}).listen(8088);

console.log("server started");