import Wireplumber from "gi://AstalWp"

const levels: [number, string][] = [
  [101, 'overamplified'],
  [67, 'high'],
  [34, 'medium'],
  [1, 'low'],
  [0, 'muted'],
]

export default function Audio() {
  const audio = Wireplumber.get_default()?.audio

  const speaker = audio?.get_default_speaker()!
  const volume = speaker.volume

  return <button onClick={() => speaker.set_mute(!speaker.get_mute())}>
    <icon icon={speaker.volume_icon} tooltip_text={`Volume ${Math.floor(volume)}%`} />
  </button>
}
