const msInADay = 8.64e+7;

const game = 
{
    'username': "",
    'date': 0,
    'player': {
        'monthlyIncome': 0,
        'balance': 0,
        'happiness': 0,
        'level': 0
    }
}

$('document').ready(() => {
    $('#incDate').on("click", () => {
        increaseDate();
    })
})

function increaseDate(n = 1)
{
    let dateElement = document.getElementById("date");
    let date = new Date(game.date);
    let newDate = new Date(date.getTime() + n * msInADay);

    let day = newDate.getDate() < 10? `0${newDate.getDate()}` : `${newDate.getDate()}`;
    let month = newDate.getMonth() < 10? `0${newDate.getMonth() + 1}` : `${newDate.getMonth() + 1}`;

    console.log(newDate);

    dateElement.innerHTML = `${day}/${month}`;
}