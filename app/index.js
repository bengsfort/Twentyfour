import clock from "clock";
import document from "document";
import { battery } from "power";
import { me as appbit } from "appbit";
import { today } from "user-activity";

// Update every
clock.granularity = "seconds";

// Time
const hourHand = document.getElementById("HourHand");
const minutesProgress = document.getElementById("MinutesProgress");

// Stats
const dateText = document.getElementById("NowDate");
const batteryText = document.getElementById("Battery");
const batteryIcon = document.getElementById("BatteryIcon");
const stepsText = document.getElementById("Steps");
const stepsIcon = document.getElementById("StepsIcon");

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

function updateDate(date) {
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // This is 0-11
  const year = date.getUTCFullYear();
  dateText.text = day + "." + month + "." + year;
}

function updateSteps() {
  if (appbit.permissions.granted("access_activity")) {
    stepsText.text = today.adjusted.steps;
  }
}

function updateClock({ date }) {
  const hours = date.getHours();
  const mins = date.getMinutes();
  const secs = date.getSeconds();

  updateSteps();
  updateDate(date);
  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minutesProgress.sweepAngle = minutesToArc(mins, secs);
}

function updateBattery() {
  batteryText.text = Math.floor(battery.chargeLevel) + "%";
  if (battery.chargeLevel <= 20) {
    batteryIcon.style.fill = "fb-red";
  } else if (battery.chargeLevel <= 50) {
    batteryIcon.style.fill = "fb-peach";
  } else {
    batteryIcon.style.fill = "fb-green";
  }
}

if (appbit.permissions.granted("access_activity")) {
  stepsIcon.style.visibility = "visible";
  stepsText.style.visibility = "visible";
} else {
  stepsIcon.style.visibility = "hidden";
  stepsText.style.visibility = "hidden";
}

updateBattery();
clock.ontick = evt => updateClock(evt);
battery.onchange = () => updateBattery();
