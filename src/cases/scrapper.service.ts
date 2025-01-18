import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { parse } from 'date-fns';
import * as console from 'node:console';
import { da } from 'date-fns/locale';
import { CaseService } from './case.service';

@Injectable()
export class ScrapperService {
  constructor() {}

  async scrape(caseService: CaseService, url: string, items: number) {
    const pageAmount = Math.ceil(items / 10); // i decided to always round up

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'], // using --no-sandbox is an insecure solution but i cannot make it work in docker otherwise...
      timeout: 100000,
      dumpio: true,
    });
    const page = await browser.newPage();

    try {
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
        console.log('There was no cookies pop-up.');
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

      let pageNumber = 1;
      while (pageNumber <= pageAmount) {
        console.log('Page ', pageNumber);
        try {
          await page.waitForSelector(loadMoreButtonSelector, { timeout: 5000 });
          await page.click(loadMoreButtonSelector);
          await page.waitForNetworkIdle();
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

      for (url of hrefs) {
        await this.goToUrl(browser, url, caseService);
      }
    } catch (error) {
      console.error('Error scraping dynamic content:', error);
    } finally {
      await browser.close();
    }
  }

  /**
   * Would be nice to add a url column so i know where the case came from and can double-check it
   */
  async goToUrl(browser: Browser, url: string, caseService: CaseService) {
    const page = await browser.newPage();

    await page.goto(url);
    await page.screenshot({
      path: 'debug-url.png',
      fullPage: true,
    });

    const caseId = await page.$eval(
      '#sidebar > div.sidebar-sag > p > span > span',
      (a) => a.textContent.trim(),
    );
    const date = await page.$eval(
      '#sidebar > div.sidebar-date > p',
      (a) => a.textContent,
    );
    const subject = await page.$eval(
      '#sidebar > div.sidebar-category > p > a',
      (a) => a.textContent.trim(),
    );
    const ruling = await page.$eval(
      '#ruling > div.container > div > div.col-md-10.first.main.ruling-body > div.html-content',
      (a) => a.textContent,
    );

    await caseService.storeCase(
      caseId,
      parse(date, 'd. MMMM yyyy.', new Date(), { locale: da }),
      subject,
      ruling,
    );

    await page.close();
  }
}
