const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

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
            monthlyIncome: 800,
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

module.exports = {
    sequelize,
    Game,
    Player,
    gameExists,
    createGame,
    fetchGame,
    updateGame
}
