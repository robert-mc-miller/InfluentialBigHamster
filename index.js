const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(express.static('public'))

app.post('/load', (req, res) => {
    const username = req.body.username

    if (fs.existsSync(path.resolve(__dirname, `./games/${username}.json`))) {
        const game = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./games/${username}.json`)))
        res.json(game)
    }
    else {
        res.status(404)
    }
})

app.post('/save', (req, res) => {
    const game = req.body
    const username = game.username

    if (Object.keys(game).length === 0) {
        res.status(400)
    }
    else {
        fs.writeFileSync(path.resolve(__dirname, `./games/${username}.json`), JSON.stringify(game))
        res.status(200)
    }
})

app.post('/create', (req, res) => {
    const username = req.body.username

    if (fs.existsSync(path.resolve(__dirname, `./games/${username}.json`))) {
        res.status(400)
    }
    else {
        const game = {
            username,
            date: 0,
            player: {
                monthlyIncome: 1600,
                balance: 0,
                happiness: 1,
                level: 0
            }
        }

        fs.writeFileSync(path.resolve(__dirname, `./games/${username}.json`), JSON.stringify(game))
        res.json(game)
    }
})

app.listen(8080, () => {
    console.log('listening...')
})
