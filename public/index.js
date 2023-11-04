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
    let day = newDate.getDate() < 9 ? `0${newDate.getDate()}` : `${newDate.getDate()}`;                 // Format date and month
    let month = newDate.getMonth() < 9 ? `0${newDate.getMonth() + 1}` : `${newDate.getMonth() + 1}`;

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
        payRent()
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

    upcomingElement.innerHTML = `Rent: £${determineRent()} - ${nextRentText}<br><br>Food: £${determineFood()} - ${nextFoodText}`;
}

function determineRent()
{
    return (Math.ceil(1 + (1/15)*(Math.pow(game.player.level, 18/10))*6)*100);
}

function determineFood()
{
    return (40+(2*(game.player.level)));
}

function payRent()
{
    if(game.player.balance >= determineRent(game.player.level))
    {
        game.player.balance -= determineRent(game.player.level);
    }
    else
    {
        if(game.player.level > 1)
        {
            game.player.level = game.player.level - 1;
        }
    }
}

function payFood(happiness)
{
    if(game.player.balance >= determineFood(level))
    {
        game.player.balance = game.player.balance - determineFood(level);
    }
    else
    {
        if(happiness >= 0.25)
        {
            happiness = happiness - 0.25;
        }
        else
        {
            happiness = 0;
        }
    }
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