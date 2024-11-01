import Wireplumber from "gi://AstalWp"
import { Variable, bind } from "astal"
import { Gtk } from "astal/gtk3"
import { EventBox } from "astal/gtk3/widget"

export default function Audio() {
  const audio = Wireplumber.get_default()?.audio

  const speaker = audio?.get_default_speaker()!

  const volumeText = bind(speaker, "volume").as(vol => `Volume ${Math.floor(vol * 100)}%`)
  const volumeIcon = bind(speaker, "volume_icon")

  const revealed = Variable(false)

  return <EventBox
    onHover={() => revealed.set(true)}
    onHoverLost={() => revealed.set(false)}
    hexpand
  ><box>
      <Gtk.Revealer
        visible
        transition_type={Gtk.RevealerTransitionType.SLIDE_RIGHT}
        valign={Gtk.Align.CENTER}
        reveal_child={true} // todo
      >
        <box css="min-width: 140px;">
          <slider hexpand onDragged={({ value }) => speaker.volume = value} value={bind(speaker, "volume")}></slider>
        </box>
      </Gtk.Revealer>
      <button
        onClick={() => speaker.set_mute(!speaker.get_mute())}
      >
        <icon icon={volumeIcon} tooltip_text={volumeText} />
      </button>
    </box>
  </EventBox>
}
