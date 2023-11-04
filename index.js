const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.post('/load', (req, res) => {
    const username = req.body.username
    const game = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./games/${username}.json`)))
    res.json(game)
})

app.post('/save', (req, res) => {
    const game = req.body
    const username = req.body.username

    fs.writeFile(path.resolve(__dirname, `./games/${username}.json`), JSON.stringify(game), (err) => {
        console.log(err)
    })
})

app.listen(8080, () => {
    console.log('listening...')
})
