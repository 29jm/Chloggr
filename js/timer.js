var seconds = 0;
var minutes = 0;
var hours = 0;
var intervalSeconds;
var timerIsOn = 0;

function timeCount()
{
   seconds = seconds + 1;
   intervalSeconds = setTimeout("timeCount()", 1000);

   if (seconds >= 60)
   {
      minutes = Math.floor (seconds / 60) + minutes;
      seconds %= 60;
   }
   if (minutes >= 60)
   {
      hours = Math.floor (minutes / 60) + hours;
      minutes %= 60;
   }
}

function playTimer() // Activates when user clicks on the "Play" button.
{
   if (!timerIsOn)// Check if the user clicks one time on the "Play" button-to avoid many timers at the same time.
   {
      timerIsOn = 1;
      timeCount();
   }
}

function stopTimer()//activates when user clicks on the "Pause" button.
{
   clearTimeout(intervalSeconds);
   timerIsOn = 0;
}