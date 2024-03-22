async function fetchOTP(emailId) {
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath: process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
    });
    const page = await browser.newPage();

    try {
        await page.goto(`https://generator.email/${emailId}`);
        await page.waitForSelector('.e7m.mess_bodiyy strong', { timeout: 10000 }); // Wait for the OTP element to appear within 10 seconds

        const otp = await page.evaluate(() => {
            const otpElements = document.querySelectorAll('.e7m.mess_bodiyy strong');
            if (otpElements.length >= 2) {
                return otpElements[1].textContent.trim(); // Get the content of the second <strong> tag
            } else {
                return null;
            }
        });

        return otp;
    } catch (error) {
        console.error(`Error occurred while fetching OTP for ${emailId}: ${error}`);
        return null;
    } finally {
        await browser.close();
    }
}

async function getEmail() {
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath: process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://generator.email/email-generator');
        
        // Wait for the email to load
        await page.waitForSelector('#email_ch_text');
        
        // Get the email text
        const email = await page.evaluate(() => {
            return document.getElementById('email_ch_text').innerText.trim();
        });

        return email;
    } catch (error) {
        console.error('Error occurred while fetching email:', error);
        return null;
    } finally {
        await browser.close();
    }
}
