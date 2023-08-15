const express = require('express')
const ejs = require('ejs')
const fs = require('fs')
const { chromium } = require('playwright')

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())

app.post('/generate-certificate', async (req, res) => {
  try {
    const company = req.body.company || 'GDT'
    const text =
      req.body.text ||
      `The company would like to extend its sincerest appreciation for your
    exceptional contribution and active participation. We highly value
    your dedication and hard work, which have made a significant impact
    on our success. Your commitment to excellence and willingness to go
    above and beyond are truly commendable.`
    const person = req.body.person || 'Oleksandr Kovalchuk'
    const date = req.body.date || '15.08.2023'

    const data = {
      company: company,
      text: text,
      person: person,
      date: date,
    }

    const backgroundPath = 'images/background.svg'
    const background = await fs.promises.readFile(backgroundPath, {
      encoding: 'base64',
    })

    const signaturePath = 'images/signature.svg'
    const signature = await fs.promises.readFile(signaturePath, {
      encoding: 'base64',
    })

    const html = await ejs.renderFile('certificate.ejs', {
      background,
      signature,
      ...data,
    })

    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.setContent(html)

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    })

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"')
    res.send(pdfBuffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(3000, () => {
  console.log('3000')
})
