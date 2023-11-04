const msInADay = 8.64e+7;
const day1 = (new Date(0)).getDay();
const game =
{
    'username': "",
    'date': 28 * msInADay,
    'player': {
        'monthlyIncome': 0,
        'balance': 0,
        'happiness': 0,
        'level': 0
    }
}

$('document').ready(() => {                                                                             // Run once HTML is rendered
    $('#incDate').on("click", () => {
        increaseDate();                                                                                 // Increment date by 1 whenever 'next' is pressed
    })
})

function increaseDate(n = 1)
{
    let dateElement = document.getElementById("date");                                                  // Get HTML element of game date
    let upcomingElement = document.getElementById("upcoming");                                          // Get HTML element of upcoming expenses
    let date = new Date(game.date);                                                                     // Parse game date from JSON into date
    let newDate = new Date(date.getTime() + n * msInADay);                                              // Get the new date with added days
    let day = newDate.getDate() < 10? `0${newDate.getDate()}` : `${newDate.getDate()}`;                 // Format date and month
    let month = newDate.getMonth() < 10? `0${newDate.getMonth() + 1}` : `${newDate.getMonth() + 1}`;

    game.date = newDate.getTime();                                                                      // Update JSON on client machine

    dateElement.innerHTML = `${day}/${month}`;                                                          // Update date on HTML

    let nextRent = parseInt((upcomingElement.innerHTML).split("<br>")[0].split(" ")[3]);                // Get previous days before next rent payment
    let nextFood = parseInt((upcomingElement.innerHTML).split("<br>")[2].split(" ")[3]);                // Get previous days before next food payment

    nextRent = Number.isNaN(nextRent) ? 0 : nextRent                                                    // Fix interpreted date if it is "Today"
    nextFood = Number.isNaN(nextFood) ? 0 : nextFood                                                    // Fix interpreted date if it is "Today"

    nextRent -= n;                                                                                      // Decrement days until rent
    nextFood -= n;                                                                                      // Decrement days until food

    while(nextRent < 0)
    {
        nextRent += parseInt(new Date(1970, newDate.getMonth() + 1, 0).getDate());                      // Adjust new days left if going to a new month
    }
    while(nextFood < 0)
    {
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

function workTask()
{
    if(game.player.balance >=100)
    {
        game.player.monthlyIncome += 250;
        game.player.happiness -= 0.05;
        game.player.balance -= 100;
        increaseDate(3);
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