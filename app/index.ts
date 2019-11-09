import clock, { TickEvent } from "clock";
import document from "document";
import { battery } from "power";
import * as messaging from "messaging";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { today } from "user-activity";
import {
  DEFAULTS,
  StorageKeys,
  StatTypes,
  DateFormats,
  ListSettingData
} from "../common/constants";

// Update every....
clock.granularity = "seconds";

// Use the defaults.
const SETTINGS = {
  ...DEFAULTS
};

const NOOP = () => {};

const UPDATE_FUNCTIONS = {
  [StatTypes.Steps]: updateSteps,
  [StatTypes.Distance]: updateDistance,
  [StatTypes.Floors]: updateFloors,
  [StatTypes.Active]: updateMinutesActive,
  [StatTypes.Calories]: updateCalories,
  // Noops because they are handled specially
  [StatTypes.Heartrate]: NOOP,
  [StatTypes.Battery]: NOOP
} as {
  [key: string]: (el: TextElement) => void;
};

const ICON_COLORS = {
  [StatTypes.Steps]: "fb-cerulean",
  [StatTypes.Distance]: "fb-aqua",
  [StatTypes.Floors]: "fb-violet",
  [StatTypes.Active]: "fb-peach",
  [StatTypes.Heartrate]: "fb-pink",
  [StatTypes.Battery]: "fb-green",
  [StatTypes.Calories]: "fb-peach"
};

// State-ish
let hrm: HeartRateSensor;
let activeHour = 0;
let activeHourNode = document.getElementById("hour_0_24") as TextElement;

// Time
const hourHand = document.getElementById("HourHand") as GroupElement;
const minutesProgress = document.getElementById(
  "MinutesProgress"
) as ArcElement;

// Stats
const dateText = document.getElementById("NowDate") as TextElement;
const bottomRightText = document.getElementById("Battery") as TextElement;
const bottomRightIcon = document.getElementById(
  "BottomRightIcon"
) as ImageElement;
const bottomLeftText = document.getElementById("Steps") as TextElement;
const bottomLeftIcon = document.getElementById(
  "BottomLeftIcon"
) as ImageElement;

// Helpers
function hoursToAngle(hours: number, minutes: number): number {
  const hourAngle = (360 / 24) * hours;
  const minAngle = (360 / 24 / 60) * minutes;
  return hourAngle + minAngle;
}

function minutesToArc(minutes: number, seconds: number): number {
  const mins = (minutes / 60) * 360;
  const secs = (seconds / 60 / 60) * 360;
  return mins + secs;
}

function round(value: number, precision: number = 0) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function heartRateIsActive(): boolean {
  return (
    SETTINGS[StorageKeys.BottomLeftStat] === StatTypes.Heartrate ||
    SETTINGS[StorageKeys.BottomRightStat] === StatTypes.Heartrate
  );
}

// Stat update functions
function updateCalories(el: TextElement) {
  if (appbit.permissions.granted("access_activity")) {
    el.text = `${today.adjusted.calories}`;
  } else {
    el.text = `--`;
  }
}

function updateSteps(el: TextElement) {
  if (appbit.permissions.granted("access_activity")) {
    el.text = `${today.adjusted.steps}`;
  } else {
    el.text = `--`;
  }
}

function updateDistance(el: TextElement) {
  if (appbit.permissions.granted("access_activity")) {
    const km = (today.adjusted.distance || 0) / 1000;
    el.text = `${round(km, 1)}km`;
  } else {
    el.text = `-- km`;
  }
}

function updateFloors(el: TextElement) {
  if (appbit.permissions.granted("access_activity")) {
    el.text = `${today.adjusted.elevationGain}`;
  } else {
    el.text = `--`;
  }
}

function updateMinutesActive(el: TextElement) {
  if (appbit.permissions.granted("access_activity")) {
    el.text = `${today.adjusted.activeMinutes}m`;
  } else {
    el.text = `-- m`;
  }
}

// Context update functions
function updateStatIcon(key: "left" | "right", val: StatTypes) {
  const icon = key === "left" ? bottomLeftIcon : bottomRightIcon;

  // We want to use the same icon for Active + Calories
  const id = val === StatTypes.Calories ? StatTypes.Active : val;
  icon.href = `stat_${id}_solid_24px.png`;
  icon.style.fill = ICON_COLORS[val];
}

function updateDate(date: Date) {
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // This is 0-11
  const year = date.getUTCFullYear();
  dateText.text =
    SETTINGS[StorageKeys.DateFormat] === DateFormats.MonthBeforeDay
      ? `${month}.${day}.${year}`
      : `${day}.${month}.${year}`;
}

function updateActiveHour(hours: number) {
  if (hours !== activeHour) {
    // Revert old one back to normal
    activeHourNode.style.fontFamily = "System-Regular";
    activeHourNode.style.fontSize = 21;

    // Cache new hour and cache node of the new active hour
    activeHour = hours;
    activeHourNode = document.getElementById(
      `hour_${activeHour}_24`
    ) as TextElement;
    activeHourNode.style.fontFamily = "System-Bold";
    activeHourNode.style.fontSize = 24;
  }
}

// Ticks
function updateTick({ date }: TickEvent) {
  const hours = date.getHours();
  const mins = date.getMinutes();
  const secs = date.getSeconds();

  // Update the bottom left/bottom right text
  const blValue = SETTINGS[StorageKeys.BottomLeftStat];
  const brValue = SETTINGS[StorageKeys.BottomRightStat];
  UPDATE_FUNCTIONS[blValue](bottomLeftText);
  UPDATE_FUNCTIONS[brValue](bottomRightText);

  updateDate(date);
  updateActiveHour(hours);

  const groupTransform = hourHand.groupTransform as Transform;
  groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minutesProgress.sweepAngle = minutesToArc(mins, secs);
}

function batteryTick() {
  // redundant, but need to figure out how to stop this from the settings page.
  if (SETTINGS[StorageKeys.BottomLeftStat] === StatTypes.Battery) {
    bottomLeftText.text = Math.floor(battery.chargeLevel) + "%";
    if (battery.chargeLevel <= 20) {
      bottomLeftIcon.style.fill = "fb-red";
    } else if (battery.chargeLevel <= 50) {
      bottomLeftIcon.style.fill = "fb-peach";
    } else {
      bottomLeftIcon.style.fill = "fb-green";
    }
  }
  if (SETTINGS[StorageKeys.BottomRightStat] === StatTypes.Battery) {
    bottomRightText.text = Math.floor(battery.chargeLevel) + "%";
    if (battery.chargeLevel <= 20) {
      bottomRightIcon.style.fill = "fb-red";
    } else if (battery.chargeLevel <= 50) {
      bottomRightIcon.style.fill = "fb-peach";
    } else {
      bottomRightIcon.style.fill = "fb-green";
    }
  }
}

function heartRateTick() {
  // redundant, but need to figure out how to stop this from the settings page.
  if (SETTINGS[StorageKeys.BottomLeftStat] === StatTypes.Heartrate) {
    bottomLeftText.text = `${hrm.heartRate}`;
  }
  if (SETTINGS[StorageKeys.BottomRightStat] === StatTypes.Heartrate) {
    bottomRightText.text = `${hrm.heartRate}`;
  }
}

function updateSettings(evt: messaging.MessageEvent) {
  const data = evt.data as ListSettingData;
  const value = data.value.values[0].value;
  SETTINGS[data.key] = value;

  console.log("Got an event from messaging:", data.key, "now equals", value);

  // Early out if it is a date event so we can do stat stuff
  if (data.key === StorageKeys.DateFormat) return;

  if (heartRateIsActive()) {
    if (!hrm.activated) {
      hrm.start();
    }
  } else {
    if (hrm.activated) {
      hrm.stop();
    }
  }

  let textEl;
  if (data.key === StorageKeys.BottomLeftStat) {
    updateStatIcon("left", value as StatTypes);
    textEl = bottomLeftText;
  } else {
    updateStatIcon("right", value as StatTypes);
    textEl = bottomRightText;
  }

  // Update the value of that corner immediately
  if (StatTypes.Battery === value) {
    batteryTick();
  } else if (StatTypes.Heartrate === value) {
    heartRateTick();
  } else {
    UPDATE_FUNCTIONS[value](textEl);
  }
}

updateStatIcon("left", SETTINGS[StorageKeys.BottomLeftStat] as StatTypes);
updateStatIcon("right", SETTINGS[StorageKeys.BottomRightStat] as StatTypes);

batteryTick();
clock.ontick = evt => updateTick(evt);

battery.addEventListener("change", batteryTick);
messaging.peerSocket.onmessage = evt => updateSettings(evt);
// @todo: This should really be managed better. It's a bit dumb and scattered.
if (HeartRateSensor) {
  console.log("Device has a heart rate sensor");
  hrm = new HeartRateSensor();
  hrm.addEventListener("reading", heartRateTick);
  if (heartRateIsActive()) {
    hrm.start();
  }
} else {
  console.log("Device does not have a heart rate sensor");
}
