# Generating Open Graph Image for Phleg

This document explains how to generate the Open Graph image for social media previews.

## Current Setup

The HTML page (`index.html`) now includes Open Graph and Twitter Card meta tags that reference:
```
https://retraut.github.io/phleg/og-image.png
```

## How to Generate the Image

### Option 1: Using Puppeteer (Node.js)

1. **Install dependencies**:
```bash
npm install puppeteer
```

2. **Create a generation script** (`generate-og.js`):
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Load the OG image HTML
    const html = await fs.readFile('og-image.html', 'utf8');
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Set viewport to OG image dimensions (1200x630)
    await page.setViewport({ width: 1200, height: 630 });

    // Take screenshot
    await page.screenshot({
        path: 'og-image.png',
        type: 'png',
        fullPage: false
    });

    await browser.close();
    console.log('OG image generated: og-image.png');
})();
```

3. **Run the script**:
```bash
node generate-og.js
```

### Option 2: Using Python with Selenium

1. **Install dependencies**:
```bash
pip install selenium pillow
```

2. **Create a generation script** (`generate-og.py`):
```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=options)

try:
    # Load the HTML file
    driver.get('file://' + os.path.abspath('og-image.html'))
    time.sleep(2)  # Wait for fonts to load

    # Set window size to OG image dimensions
    driver.set_window_size(1200, 630)

    # Take screenshot
    driver.save_screenshot('og-image.png')
    print('OG image generated: og-image.png')

finally:
    driver.quit()
```

### Option 3: Manual Generation (Simplest)

Since we can't run headless browsers here, you can:

1. **Open `og-image.html` in your browser**
2. **Take a screenshot** manually (Cmd+Shift+4 on Mac, Snipping Tool on Windows)
3. **Crop to 1200x630 pixels**
4. **Save as `og-image.png` in the `docs/` folder**

### Option 4: Online Tools

Use free online tools to convert HTML to PNG:
- [HTML/CSS to Image API](https://htmlcsstoimage.com/)
- [ScreenshotAPI.net](https://screenshotapi.net/)
- [URL2PNG](https://www.url2png.com/)

## Image Specifications

- **Dimensions**: 1200 × 630 pixels (recommended for social media)
- **Format**: PNG (supports transparency)
- **Aspect Ratio**: 1.91:1
- **File Size**: Keep under 5MB

## Testing the Preview

1. **Facebook Sharing Debugger**:
   https://developers.facebook.com/tools/debug/

2. **Twitter Card Validator**:
   https://cards-dev.twitter.com/validator

3. **LinkedIn Post Inspector**:
   https://www.linkedin.com/post-inspector/

4. **Discord/Telegram**: Just paste the URL in a message

## Quick Test Commands

Check if meta tags are present:
```bash
curl -s https://retraut.github.io/phleg/ | grep -i "og:\|twitter:" | head -10
```

Check image URL:
```bash
curl -I https://retraut.github.io/phleg/og-image.png
```

## Fallback Options

If you can't generate the image immediately, you can:

1. **Use a placeholder** temporarily:
   ```html
   <meta property="og:image" content="https://via.placeholder.com/1200x630/0a0a0a/00ff41?text=Phleg+Digital+Oracle">
   ```

2. **Remove the image tag** temporarily (will show text-only preview):
   ```html
   <!-- Remove or comment out og:image and twitter:image lines -->
   ```

## Commit and Deploy

Once you have `og-image.png`:
```bash
git add docs/og-image.png
git commit -m "Add Open Graph image for social media preview"
git push origin main
```

## Notes

- GitHub Pages may cache images, so changes might take a few minutes to appear
- Some platforms (like Discord) cache previews aggressively - you may need to wait or use a different URL for testing
- The image should represent your brand and include key information about Phleg