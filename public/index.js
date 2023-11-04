
let game = {}

function loadGame(username) {
    $.post('/load', { username }, (data) => {
        game = data
    })
}

function saveGame() {
    if (Object.keys(game).length > 0) {
        $.post('/save', game)
    }
    else {
        console.log('Cannot save game.')
    }
}
