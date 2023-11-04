
let game = {}
let saveInterval

function getCookie(name) {
    for (let cookie of document.cookie.split(';')) {
        let parts = cookie.split('=')
        if (parts[0] === name) {
            return parts[1]
        }
    }
    return undefined
}

$(window).on('load', () => {

    let username = getCookie('username')

    if (username) {
        loadGame(username)
    }

    saveInterval = setInterval(() => {
        saveGame()
    }, 1000 * 60)
})

$(window).on('beforeunload', () => {
    if (Object.keys(game).includes('username')) {
        document.cookie = `username=${game.username}`
    }
    saveGame()
})

function loadGame(username) {
    $.ajax({
        method: 'post',
        url: '/load',
        contentType: 'application/json',
        data: JSON.stringify({ username }),
        success: (data) => {
            game = data
        }
    })
}

function saveGame() {
    if (Object.keys(game).length > 0) {
        $.ajax({
            method: 'POST',
            url: '/save',
            contentType: 'application/json',
            data: JSON.stringify(game)
        })
    }
    else {
        console.log('No game to save')
    }
}

function createGame(username) {
    $.ajax({
        method: 'post',
        url: '/create',
        contentType: 'application/json',
        data: JSON.stringify({ username }),
        success: (data) => {
            game = data
        }
    })
}
