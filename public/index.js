
let game = {}

function loadGame(username) {
    $.ajax({
        method: 'post',
        url: '/load',
        data: { username },
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
            data: game,
            contentType: 'application/json'
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
        data: { username },
        success: (data) => {
            game = data
        }
    })
}
