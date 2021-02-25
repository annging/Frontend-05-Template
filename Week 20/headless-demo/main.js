const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: ''
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/main.html');
  const hrefElement = await page.$('a');
  await hrefElement.click();
  // ...
})();