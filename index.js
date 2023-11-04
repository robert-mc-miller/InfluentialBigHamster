const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'))

const gamesDir = path.resolve(__dirname, './games')

app.post('/load', (req, res) => {
    const username = req.body.username

    if (fs.existsSync(`${gamesDir}/${username}.json`)) {
        const game = JSON.parse(fs.readFileSync(`${gamesDir}/${username}.json`))
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
        fs.writeFileSync(`${gamesDir}/${username}.json`, JSON.stringify(game))
        res.status(200)
    }
})

app.post('/create', (req, res) => {
    const username = req.body.username

    if (fs.existsSync(`${gamesDir}/${username}.json`)) {
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

        fs.writeFileSync(`${gamesDir}/${username}.json`, JSON.stringify(game))
        res.status(200)
    }
})

app.post('/login', bodyParser.urlencoded({ extended: false }), (req, res) => {
    const username = req.body.username

    if (!fs.existsSync(`${gamesDir}/${username}.json`)) {
        const game = {
            username,
            date: 0,
            player: {
                monthlyIncome: 600,
                balance: 1000,
                happiness: 100,
                level: 0
            }
        }

        fs.writeFileSync(`${gamesDir}/${username}.json`, JSON.stringify(game))
    }

    res.cookie('username', username)
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/', (req, res) => {
    res.render('game')
})

app.get('/leaderboard', (req, res) => {
    const users = []
    const files = fs.readdirSync(gamesDir)

    for (let i = 0; i < files.length; i++) {
        const game = JSON.parse(fs.readFileSync(`${gamesDir}/${files[i]}`))
        users.push({
            position: i + 1,
            username: game.username,
            level: game.player.level,
            balance: game.player.balance,
            happiness: game.player.happiness
        })
    }

    res.render('leaderboard', { users })
})

if (!fs.existsSync(gamesDir)) {
    fs.mkdirSync(gamesDir)
}

app.listen(8080, () => {
    console.log('listening...')
})
