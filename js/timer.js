var seconds = 0;
var intervalSeconds;
var timerIsOn = 0;

function timeCount() {
   seconds++;
   intervalSeconds = setTimeout("timeCount()", 1000);
}

function playTimer() {
   if (!timerIsOn) {
      timerIsOn = 1;
      timeCount();
   }
}

function stopTimer() {
   clearTimeout(intervalSeconds);
   timerIsOn = 0;
}

function resetTimer() {
   seconds = 0;
   intervalSeconds;
   timerIsOn = 0;
   playTimer();
}