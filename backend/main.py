import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup
import pandas as pd
from PIL import Image
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup Selenium WebDriver
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode (no UI)
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--window-size=1920x1080")  # Set window size to full HD


@app.get("/")
def read_root():
    return {"message": "Web Scraper API is running!"}


@app.get("/scrape/")
def scrape(url: str, selector: str):
    try:
        # Fetch HTML page
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract elements based on user input selector
        elements = soup.select(selector)

        if not elements:
            raise HTTPException(status_code=404, detail="Elemen tidak ditemukan!")

        data = []
        for i, el in enumerate(elements):
            data.append({"No": i + 1, "HTML": str(el)})

        # Save data to Excel
        df = pd.DataFrame(data)
        filename = "scraped_data.xlsx"
        df.to_excel(filename, index=False)

        # **Take Screenshot of the Element**
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(url)

        # Wait for the element to be present
        try:
            element = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
            )

            # Debug: Ensure the element is visible and inspect its position
            element_location = element.location
            element_size = element.size
            print(f"Element location: {element_location}")
            print(f"Element size: {element_size}")

            # Sembunyikan elemen yang menghalangi, jika ada
            driver.execute_script("""
                var popups = document.querySelectorAll('.popup, .modal, .overlay');
                popups.forEach(function(popup) {
                    popup.style.display = 'none';
                });
            """)

            # Scroll ke elemen yang ingin diambil screenshot
            driver.execute_script("arguments[0].scrollIntoView(true);", element)

            # Wait some extra time for page to stabilize
            time.sleep(1)  # Adjust this sleep time as needed

            # Save the screenshot
            screenshot_path = os.path.join(os.getcwd(), "static", "screenshot.jpg")
            element.screenshot(screenshot_path)

            # Debug: Check if screenshot is empty
            if os.path.getsize(screenshot_path) == 0:
                raise HTTPException(status_code=500, detail="Screenshot is empty!")

            # Convert to JPG to make it lighter
            img = Image.open(screenshot_path)
            img = img.convert("RGB")
            img.save(screenshot_path, "JPEG", quality=80)

        except Exception as e:
            driver.quit()
            raise HTTPException(status_code=500, detail=f"Gagal mengambil screenshot: {str(e)}")

        driver.quit()

        # Return results in JSON with link to screenshot
        return JSONResponse(
            content={
                "status": "success",
                "data": [{"No": i + 1, "html": str(el)} for i, el in enumerate(elements)],
                "screenshot_url": "http://localhost:8000/static/screenshot.jpg",
                "file": filename,
            }
        )

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching URL: {str(e)}")
