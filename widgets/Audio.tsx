import Wireplumber from "gi://AstalWp"
import { bind } from "astal"
import { cn, percentage } from "../utils"

export default function Audio() {
  const audio = Wireplumber.get_default()?.audio

  const speaker = audio?.get_default_speaker()!

  const volumeText = bind(speaker, "volume").as(vol => `Volume ${percentage(vol)}`)
  const volumeIcon = bind(speaker, "volume_icon").as(vol => {
    console.log(vol)

    return vol
  })

  // discord uses deafened for hearing, muted for speaking. when I add a mic
  // indicator I'll use the muted class there
  return <box className={cn('Audio', { deafened: bind(speaker, 'mute') })()}>
    <button
      onClick={() => speaker.set_mute(!speaker.get_mute())}
    >
      <icon icon={volumeIcon} tooltip_text={volumeText} />
    </button>
  </box>
}
