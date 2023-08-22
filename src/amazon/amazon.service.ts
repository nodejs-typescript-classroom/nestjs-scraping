import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';
@Injectable()
export class AmazonService {
  constructor(private readonly configService: ConfigService) {}
  async getProducts(product: string) {
    const brower = await puppeteer.launch({
      // ignoreDefaultArgs: ['--mute-audio'],
      headless: true,
      executablePath: executablePath(),
    });
    try {
      const page = await brower.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);
      await Promise.all([
        page.waitForNavigation(),
        page.goto('https://amazon.com'),
      ]);
      await page.type('#twotabsearchtextbox', product);
      await Promise.all([
        page.waitForNavigation(),
        page.click('#nav-search-submit-button'),
      ]);
      return await page.$$eval(
        '.s-search-results .s-card-container',
        (resultItems) => {
          return resultItems.map((resultItem) => {
            const url = resultItem.querySelector('a').href;
            const title = resultItem.querySelector(
              '.s-title-instructions-style span',
            )?.textContent;
            const price = resultItem.querySelector(
              '.a-price .a-offscreen',
            ).textContent;
            return {
              url,
              title,
              price,
            };
          });
        },
      );
    } finally {
      await brower.close();
    }
  }
}
