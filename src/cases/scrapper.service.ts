import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { parse } from 'date-fns';
import * as console from 'node:console';
import { da } from 'date-fns/locale';
import { CaseService } from './case.service';

@Injectable()
export class ScrapperService {
  constructor() {}

  async scrapeWebsite(caseService: CaseService, url: string, pages: number) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'], // using --no-sandbox is an insecure solution! should not be used in production!
      timeout: 100000,
      dumpio: true,
    });
    const page = await browser.newPage();

    try {
      await page.goto(url);
      await this.consentToCookies(page);

      const loadMoreButtonSelector = 'button#view-more';
      const radioButtonSelector = 'input#dato-up';

      try {
        await page.waitForSelector(radioButtonSelector, { timeout: 5000 });
        await page.click(radioButtonSelector);
        await page.waitForNetworkIdle();
        console.log('Sorted the rulings by desc...');
      } catch {
        console.log('Could not sort the cases.');
      }

      let pageNumber = 1;
      while (pageNumber <= pages) {
        console.log(`Loading page ${pageNumber}...`);
        try {
          await page.waitForSelector(loadMoreButtonSelector, { timeout: 5000 });
          await page.click(loadMoreButtonSelector);
          await page.waitForNetworkIdle();
          pageNumber += 1;
        } catch {
          console.log('Cannot load any more pages!');
          pageNumber = pages;
        }
      }

      const hrefs = await page.$$eval('a.full-link', (as) =>
        as.map((a) => a.href),
      );

      for (url of hrefs) {
        await this.scrapeRuling(browser, url, caseService);
      }
    } catch (error) {
      console.error(`Error scraping the ${url} page: `, error);
    } finally {
      await browser.close();
    }
  }

  async consentToCookies(page: Page) {
    const cookiesConsent =
      'button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll';
    try {
      await page.waitForSelector(cookiesConsent, { timeout: 5000 });
      await page.click(cookiesConsent);
      await page.waitForNetworkIdle();
      console.log('Consented to cookies.');
    } catch {
      console.log('No cookies to consent to :(');
    }
  }

  async scrapeRuling(browser: Browser, url: string, caseService: CaseService) {
    const page = await browser.newPage();

    try {
      await page.goto(url);

      const caseIds = await page.$eval(
        '#sidebar > div.sidebar-sag > p > span > span',
        (a) => a.textContent.trim().split(/, |,| og /),
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
        url,
        caseIds,
        parse(date, 'd. MMMM yyyy.', new Date(), { locale: da }),
        subject,
        ruling,
      );
    } catch (error) {
      console.log(`There was an error scraping ${url} :`, error);
    }

    await page.close();
  }
}
