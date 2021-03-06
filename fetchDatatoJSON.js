'use strict';
const puppeteer = require('puppeteer');
// const Datastore = require('nedb');
// const Downloader = require('./downloader');
const fs = require('fs');
const path = require('path')
// Categories
// weapons,build,items,resources,clothing,tools,medical,food,ammo,traps,misc,components,electrical,fun
// ammo,build,clothing,components,electrical,food,fun,items,medical,misc,resources,tools,traps,weapons
// !!! Change Item category value to one of the categories above. !!! > Then run node rustLabScraper.js 
// This will create a directory for the item image and the databases. 
var itemCategory = "ammo";
// Create path 

var filepath = path.resolve(__dirname, "assets/items/" + itemCategory + "/");
var pathForDB = "assets/items/" + itemCategory + "/"
if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
}

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
        await page.goto("https://rustlabs.com/group=" + itemCategory, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        // const database =  new Datastore('item-dbs/' + itemCategory + '.db');
        let jsonDataRAW = fs.readFile('JSON_Data.json', (err, jsonDataRAW) => {
            if (err) throw err;
            let jsonData = JSON.parse(jsonDataRAW);
            console.log(jsonData);
        });
        // database.loadDatabase();
        // Check X-path
        const hrefs = await page.$$eval('#wrap > div > a', as => as.map(a => a.href));
        for (var index = 0; index < 3; index++) {
            // console.log(hrefs[index]);
            // Goto each page from homepage
            await page.goto(hrefs[index]);
            // Add wanted data here
            // itemName, itemDescription, shortcode, image, stackSize, itemID
            const [itemName_El] = await page.$x('/html/body/div[1]/div[1]/div[1]/div[1]/h1');
            const itemNameTxt = await itemName_El.getProperty('textContent');
            const itemName = await itemNameTxt.jsonValue();
            // ItemDescription
            const [itemDescription_El] = await page.$x('/html/body/div[1]/div[1]/div[1]/div[1]/p');
            const itemDescriptionTxt = await itemDescription_El.getProperty('textContent');
            const itemDescription = await itemDescriptionTxt.jsonValue();
            // Image
            const [image_El] = await page.$x('//*[@id="left-column"]/div[1]/div[2]/img');
            const imageSrc = await image_El.getProperty('src');
            const image = await imageSrc.jsonValue();
            //Download Image
            // Downloader.download(image, filepath, function (filename) {
            //     console.log("Download complete for " + filename);
            // });
            // Shortcode
            const shortcodeStr = "begin_" + image + "_end";
            var rmBegin = shortcodeStr.replace(/begin_https:\/\/rustlabs.com\/img\/items180\//g, "");
            var rmEnd = rmBegin.replace(/.png_end/g, "");
            const shortcode = rmEnd;
            // Stack Size
            const [stackSize_El] = await page.$x('/html/body/div[1]/div[2]/div/table/tbody/tr[2]/td[2]');
            const stackSizeTxt = await stackSize_El.getProperty('textContent');
            const stackSizeStr = await stackSizeTxt.jsonValue();
            var stackSizeRm = stackSizeStr.replace(/×/g, "");
            var stackSize = parseInt(stackSizeRm);
            // Item ID
            const [itemID_El] = await page.$x('/html/body/div[1]/div[2]/div/table/tbody/tr[1]/td[2]');
            const itemIDTxt = await itemID_El.getProperty('textContent');
            const itemID = await itemIDTxt.jsonValue();
            var itemIDint = parseInt(itemID);
            var imageFinal = pathForDB + shortcode + ".png";
            // console.log(stackSize, shortcode, itemIDint, imageFinal);
            var itemBlock = [];

            var item = {
                "itemName": itemName,
                "itemDescription": itemDescription,
                "shortcode": shortcode,
                "image": imageFinal,
                "stackSize": stackSize,
                "itemID": itemIDint,
                "itemCategory": itemCategory
            };
            let data = JSON.stringify(item, null, 4);
            itemBlock += data;
            fs.writeFile('JSON_Data.json', itemBlock, (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });
            console.log('This is after the write call');
            // allItems += JSON.stringify(data);
            // database.insert();
            // end data log
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