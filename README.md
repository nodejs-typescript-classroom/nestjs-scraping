# nestjs-scraping

This project is for use puppeteer to scrap content from website

## init project

```shell
nest new nestjs-scraping
cd nestjs-scraping
```

## generate module for climb amazon

```shell
nest g mo amazon
```

## generate service for amazon

```shell
nest g s amazon
```

## create controller

```shell
nest g c amazon
```

## write logic for api

in controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { AmazonService } from './amazon.service';

@Controller('amazon')
export class AmazonController {
  constructor(private readonly amazonService: AmazonService) {}

  @Get('products')
  getProducts(@Query('product') product: string) {
    return this.amazonService.getProducts(product);
  }
}

```
in service 
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AmazonService {
  async getProducts(product: string) {
    throw new Error('Method not implemented.');
  }
}
```

## install puppeteer

```shell
pnpm i puppeteer-core -S
pnpm i puppeteer -S
```

to avoid block by browser

need to use remote website

use bright data

## write scraping logic
```typescript
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

```