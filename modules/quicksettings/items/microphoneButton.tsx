import { createBinding, createComputed } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";
import { qs_page_set } from "../quicksettings";
import { QSButton } from "@/widget/QSButton";

const wp = AstalWp.get_default()!

export default function MicrophoneButton() {
  const microphone = wp.get_default_microphone();
  const mute = createBinding(microphone, "mute");
  const volume = createBinding(microphone, "volume");
  const level = createComputed(() => {
    if (mute()) return "";
    else return `${Math.floor(volume() * 100)}%`;
  });

  const microphoneUp = () => microphone.set_volume(microphone.volume + 0.01)
  const microphoneDown = () => microphone.set_volume(microphone.volume - 0.01)

  return (
    <QSButton
      icon={microphone.icon}
      label={"Microphone"}
      subtitle={level((level) => (level !== "None" ? level : "None"))}
      onClicked={() => microphone.set_mute(!microphone.get_mute())}
      onArrowClicked={() => qs_page_set("volume")}
      onScrollUp={microphoneUp}
      onScrollDown={microphoneDown}
      arrow={"separate"}
      ArrowClasses={mute((p) => {
        const classes = ["arrow"];
        !p && classes.push("active");
        return classes;
      })}
      ButtonClasses={mute((p) => {
        const classes = ["qs-button-box-arrow"];
        !p && classes.push("active");
        return classes;
      })}
    />
  );
}
