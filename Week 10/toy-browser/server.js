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
`<html maaa=a>
<head>
    <style>
			#contaner{
				width: 500px;
				height: 300px;
				display: flex;
				background-color: rgb(255,255,255)
			}
			#container #myid{
				width: 200px;
				height: 100px;
				background-color: rgb(255,0,0)
			}
			#container .c2{
				flex: 1;
				background-color: rgb(0,255,0)
			}
    </style>
</head>
<body>
    <div id="container">
				<div id="myid"/>
				<div class="c2"/>
    </div>
</body>
</html>`);
        console.log("server end");
    })
}).listen(8088, err => {
    if (err) {
        console.log('listen: ', err);
    }
});

console.log("server started");