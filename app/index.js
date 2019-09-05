import clock from "clock";
import document from "document";
import { battery } from "power";
import * as messaging from "messaging";
import { me as appbit } from "appbit";
import { today } from "user-activity";

// Update every
clock.granularity = "seconds";

// let use12hr = preferences.clockDisplay === "12h"; // removed for now
let activeHour = 0;
let activeHourNode = document.getElementById("hour_0_24");

// Time
const hourHand = document.getElementById("HourHand");
const minutesProgress = document.getElementById("MinutesProgress");

// Stats
const dateText = document.getElementById("NowDate");
const batteryText = document.getElementById("Battery");
const batteryIcon = document.getElementById("BatteryIcon");
const stepsText = document.getElementById("Steps");
const stepsIcon = document.getElementById("StepsIcon");

let monthBeforeDay = false;

// Helpers
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

// Update Functions
function updateDate(date) {
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // This is 0-11
  const year = date.getUTCFullYear();
  dateText.text = monthBeforeDay
    ? `${month}.${day}.${year}`
    : `${day}.${month}.${year}`;
}

function updateSteps() {
  if (appbit.permissions.granted("access_activity")) {
    stepsText.text = today.adjusted.steps;
  }
}

function updateActiveHour(hours) {
  if (hours !== activeHour) {
    // Revert old one back to normal
    activeHourNode.style.fontFamily = "System-Regular";
    activeHourNode.style.fontSize = 21;

    // Cache new hour and cache node of the new active hour
    activeHour = hours;
    activeHourNode = document.getElementById(`hour_${activeHour}_24`);
    activeHourNode.style.fontFamily = "System-Bold";
    activeHourNode.style.fontSize = 24;
  }
}

function updateClock({ date }) {
  // @todo: Removed for now
  // if ((preferences.clockDisplay === "12h") !== use12hr) {
  //   use12hr = preferences.clockDisplay === "12h";
  //   makeClock12hr(use12hr);
  // }

  const hours = date.getHours();
  const mins = date.getMinutes();
  const secs = date.getSeconds();

  updateSteps();
  updateDate(date);
  updateActiveHour(hours);

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

function updateDateFormat(evt) {
  console.log(
    "updating the date format to have month before day == " + evt.data.value
  );
  monthBeforeDay = evt.data.value;
}

// @todo: Removed this cause I can't seem to find the 12hr pref option anywhere and this is a 24hr face.
// function makeClock12hr(val) {
//   let node = document.getElementById("hour_0_24");
//   node.text = val ? "12" : "0";
//   for (let h = 13; h <= 23; h++) {
//     node = document.getElementById(`hour_${h}_24`);
//     node.text = `${val ? h - 12 : h}`;
//   }
// }
// makeClock12hr(use12hr);

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
messaging.peerSocket.onmessage = evt => updateDateFormat(evt);
