# 学习笔记
### 课程要点
利用LL语法解析四则运算AST
### 相关知识点
* [LL分析器](https://zh.wikipedia.org/wiki/LL%E5%89%96%E6%9E%90%E5%99%A8)是一种处理某些上下文无关文法的自顶向下分析器。因为它从左（Left）到右处理输入，再对句型执行最左推导出语法树
* AST(Abstract Syntax Tree) 叫做抽象语法树 构建AST的过程叫做词法分析。
* 四则运算的定义
  ```
  词法定义：  
  TokenNumber: · 1 2 3 4 5 6 7 8 9 0 的组合  
  Operator: + - * / 之一  
  Whitespace: <SP>  
  LineTerminator: <LF><CR>  

  语法定义：
  <Expression>::=  
  <AdditiveExpression><EOF>  
  <AdditiveExpression>::=  
  <MultiplicativeExpression>  
  |<AdditiveExpression><+><MultiplicativeExpression>  
  |<AdditiveExpression><-><MultiplicativeExpression>  
  <MultiplicativeExpression>::=  
  <Number>  
  |<MultiplicativeExpression><*><Number>  
  |<MultiplicativeExpression></><Number>  
  ```
* RegExp 对象用于将文本与一个模式匹配。
### 参考链接
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions  
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex  
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/function*  
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/throw  
Regex练习: https://alf.nu/RegexGolf    

