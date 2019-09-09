import { StorageKeys, DateFormats, StatTypes } from "../common/constants";

function TwentyfourSettings() {
  return (
    <Page>
      <Section
        title={
          <Text bold align="center">
            Date format
          </Text>
        }
      >
        <Select
          label="Date order"
          settingsKey={StorageKeys.DateFormat}
          options={[
            { name: "Month before day", value: DateFormats.MonthBeforeDay },
            { name: "Day before month", value: DateFormats.DayBeforeMonth }
          ]}
        />
      </Section>
      <Section
        title={
          <Text bold align="center">
            Stats
          </Text>
        }
      >
        <Select
          label="Bottom left stat"
          settingsKey={StorageKeys.BottomLeftStat}
          options={[
            { name: "Steps", value: StatTypes.Steps },
            { name: "Battery", value: StatTypes.Battery },
            { name: "Distance", value: StatTypes.Distance },
            { name: "Floors", value: StatTypes.Floors },
            { name: "Active", value: StatTypes.Active },
            { name: "Heartrate", value: StatTypes.Heartrate }
          ]}
        />
        <Select
          label="Bottom right stat"
          settingsKey={StorageKeys.BottomRightStat}
          options={[
            { name: "Steps", value: StatTypes.Steps },
            { name: "Battery", value: StatTypes.Battery },
            { name: "Distance", value: StatTypes.Distance },
            { name: "Floors", value: StatTypes.Floors },
            { name: "Active", value: StatTypes.Active },
            { name: "Heartrate", value: StatTypes.Heartrate }
          ]}
        />
      </Section>
      <Section
        title={
          <Text bold align="center">
            Author
          </Text>
        }
      >
        <Text>
          Made with 💙 in Helsinki, Finland by Bengsfort. I stream video games
          and app/video game development on Twitch if you are into that sort of
          thing.
        </Text>
        <Link source="https://twitch.tv/bengsfort">@bengsfort on twitch</Link>
      </Section>
    </Page>
  );
}

registerSettingsPage(TwentyfourSettings);
