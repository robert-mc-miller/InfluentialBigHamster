const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

const app = express()
const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql',
    logging: false
})

const Game = sequelize.define('games', {
    username: {
        type: DataTypes.STRING(16),
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    date: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    }
})

const Player = sequelize.define('players', {
    monthlyIncome: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    balance: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    happiness: {
        type: DataTypes.FLOAT.UNSIGNED,
        allowNull: false
    },
    level: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
})

Game.hasOne(Player)
Player.belongsTo(Game)

async function gameExists(username) {
    const player = await Player.findOne({
        where: {
            gameUsername: username
        }
    })
    return player ? true : false
}

async function createGame(username) {
    const player = (await Player.findOrCreate({
        where: {
            gameUsername: username
        },
        defaults: {
            monthlyIncome: 660,
            balance: 500,
            happiness: 1,
            level: 0,
            game: {
                username,
                date: 0
            }
        },
        include: [Game]
    }))[0]

    return {
        username,
        date: player.game.date,
        player: {
            monthlyIncome: player.monthlyIncome,
            balance: player.balance,
            happiness: player.happiness,
            level: player.level
        }
    }
}

async function fetchGame(username) {
    const player = await Player.findOne({
        where: {
            gameUsername: username
        },
        include: [Game]
    })

    return {
        username,
        date: player.game.date,
        player: {
            monthlyIncome: player.monthlyIncome,
            balance: player.balance,
            happiness: player.happiness,
            level: player.level
        }
    }
}

async function updateGame(data) {
    await Game.update({
        username: data.username,
        date: data.date
    }, {
        where: { username: data.username }
    })
    await Player.update({
        monthlyIncome: data.player.monthlyIncome,
        balance: data.player.balance,
        happiness: data.player.happiness,
        level: data.player.level
    }, {
        where: { gameUsername: data.username }
    })
}

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
        order: ['balance', 'DESC'],
        include: [Game]
    })

    players = players.map((player, index) => {
        return {
            position: index,
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
