import Adw from "gi://Adw?version=1";
import { theme } from "@/lib/constants";
import NetworkButton from "./items/networkButton";
import BluetoothButton from "./items/bluetoothButton";
import VolumeButton from "./items/volumeButton";
import MicrophoneButton from "./items/microphoneButton";

export function QSButtons() {
  const buttons = [<VolumeButton />, <MicrophoneButton />, <NetworkButton />, <BluetoothButton />]

  return (
    <Adw.WrapBox
      class={"qs-buttons"}
      child_spacing={theme.spacing}
      lineSpacing={theme.spacing}
      widthRequest={440 - theme.window.padding * 2}
      naturalLineLength={440 - theme.window.padding * 2}
      justify={Adw.JustifyMode.SPREAD}
    >
      {buttons}
      {buttons.length % 2 !== 0 && <box widthRequest={theme.quicksettings.buttonwidth} />}
    </Adw.WrapBox>
  );
}
