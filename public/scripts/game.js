const msInADay = 8.64e+7;
const firstDayOfWeek = (new Date(0)).getDay() - 1;
let game = {};
let saveInterval;

$(window).on('load', () => {

    let username = getCookie('username')

    if (username) {
        loadGame(username);
    }
    else {
        window.location.href = '/login'
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

$('document').ready(() => {                                                                             // Run once HTML is rendered
    $('#incDate').on("click", () => {
        increaseDate();                                                                                 // Increment date by 1 whenever 'next' is pressed
    });
})

function increaseDate(n = 1)
{
    let dateElement = document.getElementById("date");                                                  // Get HTML element of game date
    let date = new Date(game.date);                                                                     // Parse game date from JSON into date
    let newDate = new Date(date.getTime() + n * msInADay);                                              // Get the new date with added days
    let day = newDate.getDate() < 9 ? `0${newDate.getDate()}` : `${newDate.getDate()}`;                 // Format date and month
    let month = newDate.getMonth() < 9 ? `0${newDate.getMonth() + 1}` : `${newDate.getMonth() + 1}`;

    game.date = newDate.getTime();                                                                      // Update JSON on client machine

    dateElement.innerHTML = `${day}/${month}`;                                                          // Update date on HTML

    let nRentToPay = 0
    let nFoodToPay = 0

    for(let m = date.getMonth(); m < newDate.getMonth(); m++)
    {
        nRentToPay++;
    }

    nFoodToPay = Math.floor(n / 7);

    if(getUpcomingFood() == "Today")
    {
        nFoodToPay = 1;
    }

    updateDisplay(nRentToPay, nFoodToPay);
}

function updateDisplay(rent = 0, food = 0)
{
    let date = new Date(game.date);
    let day = date.getDate() < 9 ? `0${date.getDate()}` : `${date.getDate()}`;
    let month = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    
    updateBalance(rent, food);
    updateUpcoming();
    document.getElementById("date").innerHTML = `${day}/${month}`;
    document.getElementById("rentPrice").innerHTML = `$${determineRent()}`;
    document.getElementById("foodPrice").innerHTML = `$${determineFood()}`;
    document.getElementById("income").innerHTML = `Income (per month): ${game.player.monthlyIncome}`;
    document.getElementById("balance").innerHTML = `$${game.player.balance}`;
    document.getElementById("happiness").innerHTML = `Happiness: ${game.player.happiness}`;
}

function updateBalance(rent, food)
{
    for(let r = 1; r <= rent; r++)
    {
        payRent();
        game.player.balance += game.player.monthlyIncome;
    }

    for(let f = 1; f <= food; f++)
    {
        payFood();
    }
}

function updateUpcoming()
{
    let nextRentElement = document.getElementById("rentTimeUntil");
    let nextFoodElement = document.getElementById("foodTimeUntil");
    let currentDate = new Date(game.date)
    let daysUntilNextRent = parseInt(new Date(1970, currentDate.getMonth() + 1, 0).getDate()) - currentDate.getDate();
    let daysUntilNextFood = firstDayOfWeek >= currentDate.getDay() ? firstDayOfWeek - currentDate.getDay() : 7 - (currentDate.getDay() - firstDayOfWeek)

    daysUntilNextRent = daysUntilNextRent == "Today" ? 0 : daysUntilNextRent;                           // Fix interpreted date if it is "Today"
    daysUntilNextFood = daysUntilNextFood == "Today" ? 0 : daysUntilNextFood;                           // Fix interpreted date if it is "Today"

    let nextRentText = ""
    let nextFoodText = ""

    nextRentText = daysUntilNextRent == 1 ? `${daysUntilNextRent} day` : `${daysUntilNextRent} days`;   // Format display of days left
    nextFoodText = daysUntilNextFood == 1 ? `${daysUntilNextFood} day` : `${daysUntilNextFood} days`;

    nextRentText = daysUntilNextRent == 0 ? "Today" : nextRentText;
    nextFoodText = daysUntilNextFood == 0 ? "Today" : nextFoodText;

    nextRentElement.innerHTML = nextRentText;
    nextFoodElement.innerHTML = nextFoodText;
}

function getUpcomingRent()
{
    return document.getElementById("rentTimeUntil").innerHTML.split(" ")[0];
}

function getUpcomingFood()
{
    return document.getElementById("foodTimeUntil").innerHTML.split(" ")[0];
}

function determineRent()
{
    return (Math.ceil(1 + (1/15)*(Math.pow(game.player.level, 18/10))*6)*400);
}

function determineFood()
{
    return (40+(2*(game.player.level)));
}

function payRent()
{
    if(game.player.balance >= determineRent())
    {
        game.player.balance -= determineRent();
    }
    else
    {
        if(game.player.level > 0)
        {
            game.player.level = game.player.level - 1;
            unpaid("rent");
        }
    }
}

function payFood()
{
    if(game.player.balance >= determineFood())
    {
        game.player.balance -= determineFood();
    }
    else
    {
        if(game.player.happiness >= 0.25)
        {
            game.player.happiness = game.player.happiness - 0.25;
        }
        else
        {
            game.player.happiness = 0;
        }
        unpaid("food");
    }
}

function unpaid(type)
{
    document.getElementById(type).style.display = "block";
}

function workTask(menuChoice){
    switch(menuChoice)
    {
        case 1:                                                                                             // 
            if(game.player.balance >= 100)
            {
                game.player.monthlyIncome += 50;
                game.player.balance -= 100;
                game.player.happiness -= 0.03;
                increaseDate();        
            }

        case 2:                                                                                         // 
            if(game.player.balance >= 300)
            {
                game.player.monthlyIncome += 150;
                game.player.balance -= 300;
                game.player.happiness -= 0.06;
                increaseDate(3);
            }
        
        case 3:
            if(game.player.balance >= 500)                                                              //
            {
                game.player.monthlyIncome += 300;
                game.player.balance -= 500;
                game.player.happiness -= 0.12;
                increaseDate(7);
            }
        
        case 4:
            if(game.player.balance >= 1050)                                                             //
            {
                game.player.monthlyIncome += 600;
                game.player.balance -= 1050;
                game.player.happiness -= 0.24;
                increaseDate(14);
            }
    }
}

function funActivity(menuChoice){
    switch(menuChoice)
    {
    case 1:                                                                                             // 
            if(game.player.balance >= 300)
            {
                game.player.happiness += 0.06;
                game.player.balance -= 300;
                increaseDate();        
            }

        case 2:                                                                                         // 
            if(game.player.balance >= 510)
            {
                game.player.happiness += 0.12;
                game.player.balance -= 510;
                increaseDate(3);
            }
        
        case 3:
            if(game.player.balance >= 960)                                                              //
            {
                game.player.happiness += 0.24;
                game.player.balance -= 960;
                increaseDate(7);
            }
        
        case 4:
            if(game.player.balance >= 1800)                                                             //
            {
                game.player.happiness += 0.48;
                game.player.balance -= 1800;
                increaseDate(14);
            }
    }
}

function vibeCheck()
{
    if (game.player.happiness < 0.25)
    {
        if(game.player.monthlyIncome >= 1250)
        {
            game.player.monthlyIncome -= 500;    
        }
        else
        {
            game.player.monthlyIncome = 750;
        }
    } 
}

function levelUpgrade()
{
    if(game.player.balance >= 500)
    {
        game.player.balance -= 500;
        game.player.level++;
        game.player.happiness += 0.1;
        updateDisplay();
    }
}

function error()
{
    document.getElementById("error").style.display = "block";
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
            updateDisplay();
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
