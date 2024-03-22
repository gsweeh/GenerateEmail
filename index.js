const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();

// Function to generate random text with 7 alphabetic characters without commas
function generateRandomText() {
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    let text = '';
    for (let i = 0; i < 7; i++) {
        text += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
    }
    return text;
}

// Function to generate random US number starting with 9435 and followed by 6 random digits
function generateRandomUSNumber() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate 6 random digits
    const usNumber = `9435${randomDigits}`; // Concatenate with '9435'
    return usNumber;
}

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

async function saveEmail(email) {
    // Check if file exists
    let existingEmails = [];
    if (fs.existsSync('emails.txt')) {
        existingEmails = fs.readFileSync('emails.txt', 'utf8').trim().split('\n');
    }

    // Check if email already exists
    if (!existingEmails.includes(email)) {
        fs.appendFileSync('emails.txt', email + '\n');
    }
}

app.get('/generate', async (req, res) => {
    try {
        const email = await getEmail();
        saveEmail(email);
        res.send(email);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while generating email.');
    }
});

app.get('/generate/:email', async (req, res) => {
    const emailId = req.params.email;
    const otp = await fetchOTP(emailId);
    if (otp) {
        res.send(otp);
    } else {
        res.status(500).send('Error generating OTP');
    }
});

// Endpoint to generate random text with 7 alphabetic characters without commas
app.get('/randomtext', (req, res) => {
    const randomText = generateRandomText();
    res.send(randomText);
});

// Endpoint to generate a random US number starting with 9435 and followed by 6 random digits
app.get('/randomus', (req, res) => {
    const randomUSNumber = generateRandomUSNumber();
    res.send(randomUSNumber);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
