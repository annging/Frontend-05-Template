## JS语言基本知识  
### 语言按照语法的分类
- 非形式语言
- 形式语言[(乔姆斯基谱系)](https://zh.wikipedia.org/wiki/%E4%B9%94%E5%A7%86%E6%96%AF%E5%9F%BA%E8%B0%B1%E7%B3%BB)
    > [(乔姆斯基谱系)](https://zh.wikipedia.org/wiki/%E4%B9%94%E5%A7%86%E6%96%AF%E5%9F%BA%E8%B0%B1%E7%B3%BB)：是计算机科学中刻画形式文法表达能力的一个分类谱系，是由诺姆·乔姆斯基于 1956 年提出的。它包括四个层次：  
    > 0- 型文法（无限制文法或短语结构文法）包括所有的文法。  
    > 1- 型文法（上下文相关文法）生成上下文相关语言。  
    > 2- 型文法（上下文无关文法）生成上下文无关语言。  
    > 3- 型文法（正规文法）生成正则语言。  

### 形式语言的分类
- 按用途  
    数据描述语言： JSON, HTML, XAML. SQL,CSS  
    编程语言：C, C++, Java, C#, Python, Ruby, Perl, Lisp, T-SQL, Clojure, Haskell, JavaScript  
- 按表达方式  
    声明式语言：JSON, HTML, XAML,SQL, CSS, lisp, Clojure, Haskell  
    命令型语言: C. C++, Java, c#, Python, Ruby, Perl, JavaScript    
    
### 产生式(BNF)
在计算机中指 Tiger 编译器将源程序经过词法分析（Lexical Analysis）和语法分析（Syntax Analysis）后得到的一系列符合文法规则（Backus-Naur Form，BNF）的语句  

### String
- 理解  
    Character 字符  
    Code Point 码点  
    Encoding 编码方式  (UTF8/UTF16 ）  

- String Template  
    模板字面量 是允许嵌入表达式的字符串字面量。你可以使用多行字符串和字符串插值功能。  
    https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/template_strings    
        `string text ${expression} string text`

### 对象
- 在设计对象的状态和行为时，我们总是遵循“行为改变状态”的原则。
