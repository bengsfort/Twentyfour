import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me } from "companion";

let KEY_DATEFORMAT = "monthBeforeDay";

function sendValue(key, val) {
  if (val) {
    sendSettingData({
      key: key,
      value: JSON.parse(val)
    });
  }
}

// Send data to the device if there is a message socket
function sendSettingData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("We don't have a peerSocket connection");
  }
}

// settings have been changed
settingsStorage.onchange = function(evt) {
  sendValue(evt.key, evt.newValue);
};

// Settings were changed while the companion was not running
if (me.launchReasons.settingsChanged) {
  sendValue(KEY_DATEFORMAT, settingsStorage.getItem(KEY_DATEFORMAT));
}
