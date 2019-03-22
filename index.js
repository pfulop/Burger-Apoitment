const puppeteer = require("puppeteer");

/**
 * burgeramt adress
 */

const URL = "https://service.berlin.de/dienstleistung/318998/standort/327427/";

/**
 * First set up all the constants
 */
const FAMILY_NAME = "test";
const EMAIL = "test@test.test";
const INTERVAL = 10000;

async function run() {
  let freeAppointment = false;
  const browser = await puppeteer.launch({ headless: false }); ///set true to not open up browser
  const page = await browser.newPage();

  while (!freeAppointment) {
    /**
     * Opens up a page and goes to the appointment calendar
     */
    await page.goto(URL);
    await page.click(".content-marginal-termin div a");
    const available = await page.$$eval(
      'a[title="An diesem Tag einen Termin buchen"]',
      divs => divs.length
    );

    /**
     * comment this part if you don't
     * want to go to the next page in calendar
     */
    if (available < 1) {
      await page.waitFor("th.next > a");
      await page.click("th.next > a");
    }

    //Checks for free apoitment in calendar
    const hasFreeApoitment = await page.$$eval(
      'a[title="An diesem Tag einen Termin buchen"]',
      divs => divs.length
    );
    if (hasFreeApoitment < 1) {
      await page.waitFor(INTERVAL); //time to wait before trying again in ms
      continue;
    }

    /**
     * Clicks first free day
     * dn then clicks first available time on that day
     */
    await page.click('td a[title="An diesem Tag einen Termin buchen"]');
    await page.waitFor("td.frei > a");
    await page.click("td.frei > a");

    /**
     * Fills out the form and submits
     */

    await page.type("#familyName", FAMILY_NAME); //your surname
    await page.type("#email", EMAIL); //your email
    await page.click("#agbgelesen"); //some mandatory checkbox
    await page.click("#register_submit"); //this will click submit

    freeAppointment = true;
  }
  browser.close();
}

run();
