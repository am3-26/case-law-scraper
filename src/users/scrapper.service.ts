import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class ScrapperService {
  async scrape(url: string, items: number) {
    const pageAmount = Math.ceil(items / 10); // i decided to always round up

    console.log('Init browser');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'], // using --no-sandbox is an insecure solution but i cannot make it work in docker otherwise...
      timeout: 100000,
      dumpio: true,
    });
    console.log('Init page');
    const page = await browser.newPage();

    try {
      console.log('Got to url :)');
      await page.goto(url);

      // thats #id
      const cookiesConsent =
        'button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll';
      try {
        await page.waitForSelector(cookiesConsent, { timeout: 5000 });
        await page.click(cookiesConsent);
        await page.waitForNetworkIdle();
        console.log('Consented to cookies :)');
      } catch {
        console.log('There was cookies pop-up.');
      }

      const loadMoreButtonSelector = 'button#view-more';
      const radioButtonSelector = 'input#dato-up';

      try {
        await page.waitForSelector(radioButtonSelector, { timeout: 5000 });
        await page.click(radioButtonSelector);
        await page.waitForNetworkIdle();
        console.log('Sorted by desc...');
      } catch {
        console.log('Could not sort the cases.');
      }

      await page.screenshot({ path: 'debug.png', fullPage: true });

      let pageNumber = 1;
      while (pageNumber <= pageAmount) {
        console.log('Page ', pageNumber);
        try {
          await page.waitForSelector(loadMoreButtonSelector, { timeout: 5000 });
          await page.click(loadMoreButtonSelector);
          await page.waitForNetworkIdle();

          await page.screenshot({
            path: 'debug-' + pageAmount + '.png',
            fullPage: true,
          });
          pageNumber += 1;
        } catch {
          console.log('Reached the end of the list.');
          pageNumber = pageAmount;
        }
      }

      const hrefs = await page.$$eval('a.full-link', (as) =>
        as.map((a) => a.href),
      );
      console.log('Links:', hrefs);

      await this.goToUrl(browser, hrefs[0]);
    } catch (error) {
      console.error('Error scraping dynamic content:', error);
    } finally {
      await browser.close();
    }
  }

  async goToUrl(browser: Browser, url: string) {
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({
      path: 'debug-url.png',
      fullPage: true,
    });
  }
}
