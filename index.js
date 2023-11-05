const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { sequelize, Game, Player, gameExists, createGame, fetchGame, updateGame } = require('./database')

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'))

app.post('/load', async (req, res) => {
    const username = req.body.username

    if (gameExists(username)) {
        const game = await fetchGame(username)
        res.json(game)
    }
    else {
        res.status(404)
    }
})

app.post('/save', (req, res) => {
    const game = req.body

    if (Object.keys(game).length === 0) {
        res.status(400)
    }
    else {
        updateGame(game)
        res.status(200)
    }
})

app.post('/create', async (req, res) => {
    const username = req.body.username

    if (await gameExists(username)) {
        res.status(400)
    }
    else {
        await createGame(username)
        res.status(200)
    }
})

app.post('/login', bodyParser.urlencoded({ extended: false }), async (req, res) => {
    const username = req.body.username

    if (!(await gameExists(username))) {
        await createGame(username)
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

app.get('/leaderboard', async (req, res) => {
    let players = await Player.findAll({
        limit: 10,
        order: [['balance', 'DESC']],
        include: [Game]
    })

    players = players.map((player, index) => {
        return {
            position: index + 1,
            username: player.game.username,
            level: player.level,
            balance: player.balance,
            happiness: player.happiness
        }
    })

    res.render('leaderboard', { users: players })
})

sequelize.sync({ force: false })
    .then(app.listen(8080))
    .then(async () => {
        console.log('listening...')
    })
