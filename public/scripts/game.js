const msInADay = 8.64e+7; // Number of ms in a full day
const firstDayOfWeek = (new Date(0)).getDay() - 1; // 01/01/1970 is Thrusday
let game = {}; // Initialise empty 'game' object
let saveInterval; // Time interval between saves

/*
 * -==============================-
 * Page loading and setup functions
 * -==============================-
*/

// -==============================-
$(window).on('load', () => {

    let username = getCookie('username') // Get username saved on client computer

    if (username) {
        loadGame(username); // If client has username cookie, load the corresponding account
    }
    else {
        window.location.href = '/login' // Otherwise prompt user to login
    }

    saveInterval = setInterval(() => {
        saveGame()
    }, 1000 * 60) // Run saveGame() every 60s

})

$(window).on('beforeunload', () => { // Runs before page is closed
    if (Object.keys(game).includes('username')) {
        document.cookie = `username=${game.username}`  // Save username of current game instance in cookie on client computer
    }
    saveGame() // Run saveGame() before closing
})

$('document').ready(() => { // Run when HTML is loaded
    $('#incDate').on("click", () => { // When '+' button is pressed
        increaseDate(); // Increment date by 1
    });
    $('#happinessUpgrade').on("click", () => {
        levelUpgrade(); // Level up the house
    });
    $('#act1').on("click", () => {
        funActivity(1);
        closeModal("funActivities");
    });
    $('#act2').on("click", () => {
        funActivity(2);
        closeModal("funActivities");
    });
    $('#act3').on("click", () => {
        funActivity(3);
        closeModal("funActivities");
    });
    $('#act4').on("click", () => {
        funActivity(4);
        closeModal("funActivities");
    });
    $('#learn1').on("click", () => {
        workTask(1);
        closeModal("learnActivities");
    });
    $('#learn2').on("click", () => {
        workTask(2);
        closeModal("learnActivities");
    });
    $('#learn3').on("click", () => {
        workTask(3);
        closeModal("learnActivities");
    });
    $('#learn4').on("click", () => {
        workTask(4);
        closeModal("learnActivities");
    });
})
// -==============================-




/*
 * -===============================-
 * Modal button management functions
 * -===============================-
*/

// -===============================-
function openModal(id) {
    $(`#${id}`).css('display', 'flex'); // Display modal on screen
}

function closeModal(id) {
    $(`#${id}`).css('display', 'none'); // Hide modal from screen
}
// -===============================-




/*
 * -========================-
 * Event functions
 * -========================-
*/

//-=========================-
function increaseDate(n = 1) {
    let dateElement = $('#date'); // Get tag containing displayed date
    let date = new Date(game.date); // Store saved game date as Date() for use
    let newDate = new Date(date.getTime() + n * msInADay); // Add n days converted to ms to current saved date converted to ms
    let day = newDate.getDate() < 10 ? `0${newDate.getDate()}` : `${newDate.getDate()}`; // Format day number
    let month = newDate.getMonth() < 9 ? `0${newDate.getMonth() + 1}` : `${newDate.getMonth() + 1}`; // Format month number

    game.date = newDate.getTime(); // Save new date

    dateElement.html(`${day}/${month}`); // Change displayed date

    randomEvent(n);
    changeHappiness(-0.01 * n);

    /*
     * Calculate amount of times rent and food expense needs to be paid after n days
     * Values can be passed into updateDisplay() to appropriately affect balance and update the shown value
    */

    let nRentToPay = 0
    let nFoodToPay = 0

    for (let m = date.getMonth(); m < newDate.getMonth(); m++) // For each month passed, pay rent
    {
        nRentToPay++;
    }

    nFoodToPay = Math.floor(n / 7); // Pay food price for every 7 days

    if (getUpcomingFood() == "Today") // Fix this later to work for all values of n
    {
        nFoodToPay = 1;
    }
    updateBalance(nRentToPay, nFoodToPay); // Update balance by paying for rent and food n number of times
    updateDisplay(); // Update display of values with new values
}

function payRent() {
    if (game.player.balance >= determineRent()) // Only pay rent if the player has enough money
    {
        game.player.balance -= determineRent();
    }
    else {
        if (game.player.level > 0) // Only downgrade if level is above 0
        {
            game.player.level = game.player.level - 1; // if player cannot pay, downgrade
            unpaid("rent"); // Display message
        }
    }
}

function payFood() {
    if (game.player.balance >= determineFood()) // Only pay for food if the player has enough money
    {
        game.player.balance -= determineFood();
    }
    else {
        changeHappiness(-0.25); // Decrease happiness
        unpaid("food"); // Display message
    }
}

function vibeCheck() {
    if (game.player.happiness < 0.25) {
        if (game.player.monthlyIncome >= 1250) {
            game.player.monthlyIncome -= 500; // If player has higher income but low happinesss, won't lose as much
        }
        else {
            game.player.monthlyIncome = 750;
        }
    }
}

function levelUpgrade() {
    if (game.player.balance >= 500) // Only upgrade if player can afford it
    {
        game.player.balance -= 500; // Deduct from balance
        game.player.level++; // Increase level
        changeHappiness(0.1); // Increase happiness
        updateDisplay(); // Update display to show new level
    }
}

function changeHappiness(amount) {
    if ((game.player.happiness + amount) > 1) {
        game.player.happiness = 1;
    }
    else if ((game.player.happiness + amount) < 0) {
        game.player.happiness = 0;
    }
    else {
        game.player.happiness += amount;
    }
}

function eventHappened(loss) {
    document.getElementById("event").style.display = "block";
    scenarios(loss);
}

function closeEvent() {
    document.getElementById("event").style.display = "none";
}

function randomEvent(n) {
    if (Math.floor(Math.random() * Math.ceil((20 - (10 * Math.tanh(n - 4) + 10)))) + 1 == 1) {
        loss = ((Math.floor(Math.random() * 4) + 1) * 100);
        eventHappened(loss);
        if (game.player.balance < loss) {
            game.player.balance = 0;
        }
        else {
            game.player.balance = game.player.balance - loss;
        }
    }
}
//-=========================-




/*
 * ==========================
 * UI management functions
 * ==========================
*/

//-=========================-
function updateDisplay() {
    let date = new Date(game.date); // Get current saved in-game date
    let day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`; // Format day number
    let month = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`; // Format month number

    updateUpcoming(); // Update upcoming expenses numbers
    $('#date').html(`${day}/${month}`); // Update displayed date
    $('#rentPrice').html(`$${determineRent().toLocaleString()}`); // Update displayed rent price
    $('#foodPrice').html(`$${determineFood().toLocaleString()}`); // Update displayed food price
    $('#income').html(`Income (per month): $${game.player.monthlyIncome.toLocaleString()}`); // Update displayed income
    $('#balance').html(`$${game.player.balance.toLocaleString()}`); // Update displayed balance
    $('#progress').attr('value', game.player.happiness * 100); // Update displayed happiness
    $('#level').html(game.player.level) // Update displayed level
}

function updateBalance(rent, food) {
    for (let r = 1; r <= rent; r++) {
        game.player.balance += game.player.monthlyIncome; // Rent is paid monthly so income is gained as well
        payRent(); // Pay rent a certain number of times
    }

    for (let f = 1; f <= food; f++) {
        payFood(); // Pay for food a certain number of times
    }
}

function updateUpcoming() {
    let nextRentElement = $('#rentTimeUntil'); // Get upcoming rent payment number
    let nextFoodElement = $('#foodTimeUntil'); // Get upcoming food payment number
    let currentDate = new Date(game.date) // Store current saved date as Date() for use
    let daysUntilNextRent = parseInt(new Date(1970, currentDate.getMonth() + 1, 0).getDate()) - currentDate.getDate(); // - date from total days in month
    let daysUntilNextFood = firstDayOfWeek >= currentDate.getDay() ? firstDayOfWeek - currentDate.getDay() : 7 - (currentDate.getDay() - firstDayOfWeek)
    /*
     * First day is Thursday (4)
     * If current day < 4, time to next weekly payment is 4 - current day
     * If current day > 4, time to next weekly payment is 7 - (current day - 4) or 7 - |4 - current day|
    */

    daysUntilNextRent = daysUntilNextRent == "Today" ? 0 : daysUntilNextRent; // Fix interpreted date if it is "Today"
    daysUntilNextFood = daysUntilNextFood == "Today" ? 0 : daysUntilNextFood; // Fix interpreted date if it is "Today"

    let nextRentText = ""
    let nextFoodText = ""

    nextRentText = daysUntilNextRent == 1 ? `${daysUntilNextRent} day` : `${daysUntilNextRent} days`; // Format display of days left
    nextFoodText = daysUntilNextFood == 1 ? `${daysUntilNextFood} day` : `${daysUntilNextFood} days`;

    nextRentText = daysUntilNextRent == 0 ? "Today" : nextRentText; // Display 0 days as "Today" for better UX
    nextFoodText = daysUntilNextFood == 0 ? "Today" : nextFoodText;

    nextRentElement.html(nextRentText); // Update displayed upcoming expenses
    nextFoodElement.html(nextFoodText);
}

function unpaid(type) {
    $(`#${type}`).css('display', 'block'); // Display block with the id corresponding to 'type'
}

function closeUnpaid(type) {
    $(`#${type}`).css('display', 'none');
}

function error() {
    openModal("error"); // Display an error block when a user tries to do something that can't be done
}

function workTask(menuChoice) { // Update values depending on type of work done
    switch (menuChoice) {
        case 1:                                                                                             // 
            if (game.player.balance >= 100) {
                game.player.monthlyIncome += 50;
                game.player.balance -= 100;
                changeHappiness(-0.03);
                increaseDate();
            }
            break;

        case 2:                                                                                         // 
            if (game.player.balance >= 300) {
                game.player.monthlyIncome += 150;
                game.player.balance -= 300;
                changeHappiness(-0.06);
                increaseDate(3);
            }
            break;

        case 3:
            if (game.player.balance >= 500)                                                              //
            {
                game.player.monthlyIncome += 300;
                game.player.balance -= 500;
                changeHappiness(-0.12);
                increaseDate(7);
            }
            break;

        case 4:
            if (game.player.balance >= 1050)                                                             //
            {
                game.player.monthlyIncome += 600;
                game.player.balance -= 1050;
                changeHappiness(-0.24);
                increaseDate(14);
            }
            break;
    }
}

function funActivity(menuChoice) { // Update values depending on type of fun activity done
    switch (menuChoice) {
        case 1: // 
            if (game.player.balance >= 300) {
                changeHappiness(0.06);
                game.player.balance -= 300;
                increaseDate();
            }
            break;

        case 2: // 
            if (game.player.balance >= 510) {
                changeHappiness(0.12);
                game.player.balance -= 510;
                increaseDate(3);
            }
            break;

        case 3: //
            if (game.player.balance >= 960) {
                changeHappiness(0.24);
                game.player.balance -= 960;
                increaseDate(7);
            }
            break;

        case 4: // 
            if (game.player.balance >= 1800) {
                changeHappiness(0.48);
                game.player.balance -= 1800;
                increaseDate(14);
            }
            break;
    }
}
//-=========================-




/*
 * -===============================-
 * Value calculating/fetch functions
 * -===============================-
*/

//-================================-
function getUpcomingRent() // Get upcoming rent from page
{
    return $('#rentTimeUntil').html().split(' ')[0];
}

function getUpcomingFood() // Get upcoming food expenses from page
{
    return $('#foodTimeUntil').html().split(' ')[0];
}

function determineRent() // Function for calculating rent depending on level
{
    return (Math.ceil(1 + (1 / 15) * (Math.pow(game.player.level, 18 / 10)) * 6) * 400);
}

function determineFood() // Function for calculating food depending on level
{
    return (40 + (2 * (game.player.level)));
}
//-================================-




/*
 * -=======================-
 * Data management functions
 * -=======================-
*/

// -=======================-
function getCookie(name) {
    for (let cookie of document.cookie.split(';')) { // Linear search of cookie for specific value
        let parts = cookie.split('=') // Separate names of properties from values
        if (parts[0] === name) {
            return parts[1] // Return searched data
        }
    }
    return undefined // Return undefined if name does not exist in cookie
}

function loadGame(username) {
    $.ajax({
        method: 'post',
        url: '/load',
        contentType: 'application/json',
        data: JSON.stringify({ username }),
        success: (data) => {
            game = data // Load game data into game object
            updateDisplay(); // Update displayed values
        }
    })
}

function saveGame() {
    if (Object.keys(game).length > 0) { // Save game if there is data to save
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
            game = data // Load default data into game object
            updateDisplay(); // Update displayed values
        }
    })
}
// -=======================-



/*
 * -=======================-
 * Data management functions
 * -=======================-
*/

// -=======================-

function scenarios(loss){
    var text = ["Your washing machine broke. You bought a new one for $",
"Your car broke down. You paid the mechanic $",
"Your pet was sick. You paid the vet $",
"You impulse bought cool things. You paid $",
"You need a new laptop. You paid $"]

    document.getElementById('alarmText').innerHTML = text[Math.floor(Math.random()*10)%5] + loss;

}

// -=======================-