function TwentyfourSettings(props) {
  return (
    <Page>
      <Section title={<Text bold>Date settings</Text>}>
        <Toggle
          settingsKey="monthBeforeDay"
          label="Show month before day? (month.day.year)"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(TwentyfourSettings);
