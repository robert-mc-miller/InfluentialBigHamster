
$(window).on('load', () => {

    let username = getCookie('username')

    if (username) {
        loadGame(username)
    }
    else {
        window.location.href = '/login.html'
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

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

const msInADay = 8.64e+7;
const day1 = (new Date(0)).getDay();
let game = {}
let saveInterval

$('document').ready(() => {                                                                             // Run once HTML is rendered
    $('#incDate').on("click", () => {
        increaseDate();                                                                                 // Increment date by 1 whenever 'next' is pressed
    })
})

function increaseDate(n = 1) {
    let dateElement = document.getElementById("date");                                                  // Get HTML element of game date
    let upcomingElement = document.getElementById("upcoming");                                          // Get HTML element of upcoming expenses
    let date = new Date(game.date);                                                                     // Parse game date from JSON into date
    let newDate = new Date(date.getTime() + n * msInADay);                                              // Get the new date with added days
    let day = newDate.getDate() < 10 ? `0${newDate.getDate()}` : `${newDate.getDate()}`;                 // Format date and month
    let month = newDate.getMonth() < 10 ? `0${newDate.getMonth() + 1}` : `${newDate.getMonth() + 1}`;

    game.date = newDate.getTime();                                                                      // Update JSON on client machine

    dateElement.innerHTML = `${day}/${month}`;                                                          // Update date on HTML

    let nextRent = parseInt((upcomingElement.innerHTML).split("<br>")[0].split(" ")[3]);                // Get previous days before next rent payment
    let nextFood = parseInt((upcomingElement.innerHTML).split("<br>")[2].split(" ")[3]);                // Get previous days before next food payment

    nextRent = Number.isNaN(nextRent) ? 0 : nextRent                                                    // Fix interpreted date if it is "Today"
    nextFood = Number.isNaN(nextFood) ? 0 : nextFood                                                    // Fix interpreted date if it is "Today"

    nextRent -= n;                                                                                      // Decrement days until rent
    nextFood -= n;                                                                                      // Decrement days until food

    while (nextRent < 0) {
        nextRent += parseInt(new Date(1970, newDate.getMonth() + 1, 0).getDate());                      // Adjust new days left if going to a new month
    }
    while (nextFood < 0) {
        nextFood += 7
    }


    let nextRentText = ""
    let nextFoodText = ""

    nextRentText = nextRent == 1 ? `${nextRent} day` : `${nextRent} days`;                              // Format display of days left
    nextFoodText = nextFood == 1 ? `${nextFood} day` : `${nextFood} days`;

    nextRentText = nextRent == 0 ? "Today" : nextRentText;
    nextFoodText = nextFood == 0 ? "Today" : nextFoodText;

    upcomingElement.innerHTML = `Rent: £100 - ${nextRentText}<br><br>Food: £50 - ${nextFoodText}`;
}

function getCookie(name) {
    for (let cookie of document.cookie.split(';')) {
        let parts = cookie.split('=')
        if (parts[0] === name) {
            return parts[1]
        }
    }
    return undefined
}

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
