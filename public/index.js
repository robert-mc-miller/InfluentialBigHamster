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

$('document').ready(() => {
    $('#incDate').on("click", () => {
        increaseDate(26);
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

    nextRent -= n;
    nextFood -= n;

    while(nextRent < 0)
    {
        nextRent += parseInt(new Date(1970, newDate.getMonth() + 1, 0).getDate());
    }
    while(nextFood < 0)
    {
        nextFood += 7
    }


    let nextRentText = ""
    let nextFoodText = ""

    nextRentText = nextRent == 1 ? `${nextRent} day` : `${nextRent} days`;
    nextFoodText = nextFood == 1 ? `${nextFood} day` : `${nextFood} days`;

    upcomingElement.innerHTML = `Rent: £100 - ${nextRentText}<br><br>Food: £50 - ${nextFoodText}`;
}