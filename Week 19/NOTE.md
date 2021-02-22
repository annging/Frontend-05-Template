# 发布系统
## 利用 express 编写服务器
- [express](https://expressjs.com/en/starter/installing.html)
- [openssh](https://www.openssh.com/)
- ```
    scp -P 8022 ./* winter@127.0.0.1:/home/winter/server
  ```
## publish-server: 用node 启动一个简单的server
## publish-tool: 发送请求的功能
## 实现多文件发布
- [npm archiver](https://www.npmjs.com/package/archiver) 
- [npm unzipper](https://www.npmjs.com/package/unzipper)
## github oAuth 实现登录鉴权
1. publish-tool 打开https://github.com/login/oauth/authorize
2. publish-server auth路由：接收code,用client_id client_secret code 换取token
3. publish-tool 创建server 接受token 然后点击发布
4. publish-server publish路由：用token获取用户信息，检查权限，接受发布
## 其他
- [Node.js的流](https://nodejs.org/docs/latest-v13.x/api/stream.html#stream_class_stream_readable)
- pipe
- [获取文件大小](https://nodejs.org/docs/latest-v13.x/api/fs.html#fs_class_fs_stats)
- [Github Developer](https://docs.github.com/en/developers/apps/identifying-and-authorizing-users-for-github-apps)
- [child_process](https://nodejs.org/api/child_process.html)
- [querystring](https://nodejs.org/api/querystring.html)
- [response.write(chunk)](https://nodejs.org/api/http.html#http_response_write_chunk_encoding_callback)