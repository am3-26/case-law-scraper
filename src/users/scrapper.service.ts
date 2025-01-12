import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class ScrapperService {
  async scrape(url: string) {
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
      const loadMoreButtonSelector = '[id="view-more"]';
      let hasMore = true;

      while (hasMore) {
        console.log('Still has more...');
        try {
          await page.waitForSelector(loadMoreButtonSelector, { timeout: 5000 });
          console.log('Selector appeared on the page!');
          await page.click(loadMoreButtonSelector);
          console.log('Clicked on the button');
        } catch {
          hasMore = false;
        }
      }

      console.log('All the law cases are on the page :)');

      const journalNumbers = await page.evaluate(() => {
        const elements = Array.from(
          document.querySelectorAll('span.meta-journalnummer'),
        );
        return elements.map((el) => el.textContent?.trim()); // Extract and clean the text content
      });

      console.log('Journal Numbers:', journalNumbers);
    } catch (error) {
      console.error('Error scraping dynamic content:', error);
    } finally {
      await browser.close();
    }
  }
}
