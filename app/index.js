import clock from "clock";
import document from "document";

// Update every
clock.granularity = "seconds";

const hourHand = document.getElementById("HourHand");
const minutesProgress = document.getElementById("MinutesProgress");

function hoursToAngle(hours, minutes) {
  const hourAngle = (360 / 24) * hours;
  const minAngle = (360 / 24 / 60) * minutes;
  return hourAngle + minAngle;
}

function minutesToArc(minutes, seconds) {
  const mins = (minutes / 60) * 360;
  const secs = (seconds / 60 / 60) * 360;
  return mins + secs;
}

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const secs = now.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minutesProgress.sweepAngle = minutesToArc(mins, secs);
}

clock.ontick = () => updateClock();
