## 单元测试工具
- 常用的测试框架：[Mocha](https://mochajs.org/) Jest
- Mocha 使用 `import {add} from '../add.js';`   
  可以在[在package中加入](https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_enabling)
  ```
    "type": "module"
  ```
- code coverage 是单元测试中最重要的概念
  相关工具[nyc](https://www.npmjs.com/package/nyc)
- [babel-plugin-istanbul](https://www.npmjs.com/package/babel-plugin-istanbul)