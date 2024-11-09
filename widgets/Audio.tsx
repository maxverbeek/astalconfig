import Wireplumber from "gi://AstalWp"
import { Variable, bind } from "astal"
import { Gtk } from "astal/gtk3"
import { EventBox } from "astal/gtk3/widget"

export default function Audio() {
  const audio = Wireplumber.get_default()?.audio

  const speaker = audio?.get_default_speaker()!

  const volumeText = bind(speaker, "volume").as(vol => `Volume ${Math.floor(vol * 100)}%`)
  const volumeIcon = bind(speaker, "volume_icon").as(vol => {
    console.log(vol)

    return vol
  })
  const isMuted = bind(speaker, "mute")

  const revealed = Variable(false)

  // discord uses deafened for hearing, muted for speaking. when I add a mic
  // indicator I'll use the muted class there
  const className = isMuted.as((m) => m ? "Audio deafened" : "Audio")

  return <EventBox
    onHover={() => revealed.set(true)}
    onHoverLost={() => revealed.set(false)}
    hexpand
    className={className}
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
