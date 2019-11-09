export enum StorageKeys {
  DateFormat = "dateFormat",
  BottomLeftStat = "bottomLeftStat",
  BottomRightStat = "bottomRightStat"
}

export enum DateFormats {
  MonthBeforeDay = "0",
  DayBeforeMonth = "1"
}

export enum StatTypes {
  Steps = "steps",
  Battery = "battery",
  Distance = "distance",
  Floors = "floors",
  Active = "active",
  Heartrate = "heartrate",
  Calories = "calories"
}

export const DEFAULTS = {
  [StorageKeys.DateFormat]: DateFormats.MonthBeforeDay,
  [StorageKeys.BottomLeftStat]: StatTypes.Steps,
  [StorageKeys.BottomRightStat]: StatTypes.Battery
} as {
  [key: string]: string;
};

interface ListSettingValue {
  name: string;
  value: string;
}

export interface ListSettingData {
  key: string;
  value: {
    values: ListSettingValue[];
    selected: number[];
  };
}
