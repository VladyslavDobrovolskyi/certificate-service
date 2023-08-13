const express = require('express')
const ejs = require('ejs')
const fs = require('fs')
const { chromium } = require('playwright')

const app = express()
app.set('view engine', 'ejs')

app.get('/generate-certificate', async (req, res) => {
  try {
    // Getting data from query parameters
    const name = req.query.name || 'Иванов Иван'
    const date = req.query.date || '10 августа 2023'

    // Data to pass to the template
    const data = {
      name: name,
      date: date,
    }

    // Specify the path to your background image
    const backgroundPath = 'images/background.png'
    const background = await fs.promises.readFile(backgroundPath, {
      encoding: 'base64',
    })

    // Rendering the EJS template to HTML
    const html = await ejs.renderFile('certificate.ejs', {
      background,
      ...data,
    })

    // Launching Playwright
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    // Setting the page content
    await page.setContent(html)

    // Generating PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    })

    // Closing Playwright
    await browser.close()

    // Setting the header to open the PDF in the browser
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"')

    // Sending the PDF as a data stream
    res.send(pdfBuffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal Server Error')
  }
})

// Starting the server
app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000')
})
