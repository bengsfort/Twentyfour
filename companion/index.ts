import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me } from "companion";
import { StorageKeys, StatTypes, DateFormats } from "../common/constants";

function sendValue(key: string, val: any) {
  if (val) {
    sendSettingData({
      key: key,
      value: JSON.parse(val)
    });
  }
}

// Send data to the device if there is a message socket
function sendSettingData(data: { key: string; value: string }) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("We don't have a peerSocket connection");
  }
}

// settings have been changed
settingsStorage.onchange = function(evt) {
  console.log("settingd changed");
  if (evt) {
    sendValue(evt.key as string, evt.newValue);
  }
};

// Settings were changed while the companion was not running
if (me.launchReasons.settingsChanged) {
  sendValue(
    StorageKeys.DateFormat,
    settingsStorage.getItem(StorageKeys.DateFormat)
  );
  sendValue(
    StorageKeys.BottomLeftStat,
    settingsStorage.getItem(StorageKeys.BottomLeftStat)
  );
  sendValue(
    StorageKeys.BottomRightStat,
    settingsStorage.getItem(StorageKeys.BottomRightStat)
  );
}

// Set defaults
if (!settingsStorage.getItem(StorageKeys.DateFormat)) {
  console.log("setting date format");
  settingsStorage.setItem(
    StorageKeys.DateFormat,
    JSON.stringify(DateFormats.MonthBeforeDay)
  );
}
if (!settingsStorage.getItem(StorageKeys.BottomLeftStat)) {
  console.log("setting bottom left");
  settingsStorage.setItem(
    StorageKeys.BottomLeftStat,
    JSON.stringify({ selected: [0] })
  );
}
if (!settingsStorage.getItem(StorageKeys.BottomRightStat)) {
  console.log("setting bottom right");
  settingsStorage.setItem(
    StorageKeys.BottomRightStat,
    JSON.stringify({ selected: [1] })
  );
}
