'use strict';
const puppeteer = require('puppeteer');

// REFERENCE FILE CAN BE RAN BY NODE 

crawlPage();

function crawlPage() {
    (async () => {

        const args = [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--blink-settings=imagesEnabled=false",
        ];
        const options = {
            args,
            headless: true,
            ignoreHTTPSErrors: true,
        };

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.goto("https://rustlabs.com/group=ammo", {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        // !!!!!!!!!!!!!!!!!!!!!!
        // Check X-path
        const hrefs = await page.$$eval('#wrap > div > a', as => as.map(a => a.href));
        for (var index = 0; index < hrefs.length; index++) {
            console.log(hrefs[index]);
            // Goto each page from homepage
            // await page.goto(hrefs[index]);
            //Log
        }
        // console.log(hrefs);
        let pages = await browser.pages();
        await Promise.all(pages.map(page => page.close()));
        // await page.close();
        await browser.close();

    })().catch((error) => {
        console.error(error);
    })
};