### 学习笔记
#### 1.使用状态机处理字符串
#### 2.HTTP请求
1. step1 设计一个HTTP请求类（从使用的角度设计）
    - Contentt-Type 是一个必要的参数，要求有默认值
    - body是KV格式
    - 不同的Content-Type影响body的格式
    - Content-Length
2. step2 send 函数
    - 在Requset的构造器中收集必要的信息
    - 设计一个send函数，把请求真实发送到服务器
    - send函数应该是异步的，所以返回Promise
3. step3 发送请求
    - 设计支持已有的Connection或者自己新建Connection
    - 收到数据传给parser
    - 根据parser状态 resolve Promise
4. step4 ResponseParser
    - Response必须分段构造，所以我们要用一个ResponseParser来“装配”
    - ResponseParser分段处理 response text ,我们使用状态机来分析文本的结构
5. step5 Response body 解析
    - Response body可能根据Content-Type 有不同的结构，因此我们采用子Parser的结构来解决问题
    - 以TrunckedBodyParser为例

