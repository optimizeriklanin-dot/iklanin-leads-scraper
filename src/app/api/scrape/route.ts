import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import puppeteer from "puppeteer";

async function delay(time: number) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();
    if (!keyword) return NextResponse.json({ error: "Keyword kosong" }, { status: 400 });

    console.log(`[▶] API Memulai scraping Google Maps untuk: "${keyword}"`);
    
    // Menjalankan Puppeteer. Fitur ini akan memunculkan Google Chrome secara live di lokal komputer.
    // Catatan VERCEL/Cloud: Vercel Free tier akan mengalami timeout setelah 10-50 detik.
    const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized", "--disable-notifications"]
    });
    
    const page = await browser.newPage();
    const searchQuery = keyword.split(" ").join("+");
    const targetUrl = `https://www.google.com/maps/search/${searchQuery}`;
    
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(5000);

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let scrolls = 0;
        const timer = setInterval(() => {
          const scrollableDiv = document.querySelector('div[role="feed"]');
          if (scrollableDiv) {
            scrollableDiv.scrollBy(0, 500);
            scrolls++;
            if (document.body.innerText.includes("You've reached the end of the list") || scrolls >= 80) {
              clearInterval(timer);
              resolve(null);
            }
          } else {
              clearInterval(timer);
              resolve(null);
          }
        }, 800);
      });
    });

    const elements = await page.$$('a[href*="https://www.google.com/maps/place/"]');
    let insertedCount = 0;

    for (let i = 0; i < elements.length; i++) {
        try {
          await elements[i].click();
          
          try {
            await page.waitForSelector('h1', { timeout: 3000 });
          } catch(e) {}
          await delay(2000); 
          
          const title = await page.evaluate(() => document.querySelector('h1')?.innerText || '');
          if (!title) continue;
  
          const { rating, reviews } = await page.evaluate(() => {
            const span = document.querySelector('span[aria-label*="stars"]') || document.querySelector('span[aria-label*="bintang"]');
            if (span) {
              const label = span.getAttribute('aria-label') || '';
              const rMatch = label.match(/([\d,\.]+)\s*(stars|bintang)/i);
              const revMatch = label.match(/([\d,\.]+)\s*(reviews|ulasan)/i);
              return {
                rating: rMatch ? rMatch[1] : '',
                reviews: revMatch ? revMatch[1] : ''
              };
            }
            return { rating: '', reviews: '' };
          });
  
          const category = await page.evaluate(() => {
            const btn = document.querySelector('.fontBodyMedium') || document.querySelector('button[jsaction*="category"]');
            if (btn && (btn as HTMLElement).innerText.includes('·')) {
               return (btn as HTMLElement).innerText.split('·')[0].trim();
            }
            return btn ? (btn as HTMLElement).innerText : '';
          });
  
          const address = await page.evaluate(() => {
            const btn = document.querySelector('button[data-item-id="address"]');
            return btn ? (btn.getAttribute('aria-label') || '').replace(/Address:\s*|Alamat:\s*/i, '').trim() : '';
          });
  
          const website = await page.evaluate(() => {
            const btn = document.querySelector('a[data-item-id="authority"]');
            return btn ? btn.getAttribute('href') : '';
          });
  
          const phone = await page.evaluate(() => {
            const btn = document.querySelector('button[data-item-id^="phone:tel:"]');
            if (btn) return (btn.getAttribute('data-item-id') || '').replace('phone:tel:', '');
            // Fallback
            const btnFall = document.querySelector('button[data-tooltip*="phone number"]');
            return btnFall ? (btnFall.getAttribute('aria-label') || '').replace(/Phone:\s*|Telepon:\s*/i, '').trim() : '';
          });
  
          const existing = await prisma.lead.findFirst({
            where: { title, phone: phone || '' }
          });
  
          if (!existing) {
            await prisma.lead.create({
              data: { title, category, rating, reviews, address, phone: phone || '', website }
            });
            insertedCount++;
          }
        } catch (e) {
          // Abaikan yang gagal ekstrak detail secara individu
        }
      }
  
      await browser.close();
      return NextResponse.json({ success: true, insertedCount });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
