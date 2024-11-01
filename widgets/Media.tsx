import AstalMpris from "gi://AstalMpris?version=0.1"
import { bind } from "astal"
import { Gtk } from "astal/gtk3"

export default function Media() {
  const mpris = AstalMpris.get_default()

  return <box className="Media">
    {bind(mpris, "players").as(ps => ps[0] ? (
      <box>
        <box
          className="Cover"
          valign={Gtk.Align.CENTER}
          css={bind(ps[0], "coverArt").as(cover =>
            `background-image: url('${cover}');`
          )}
        />
        <label
          label={bind(ps[0], "title").as(() =>
            `${ps[0].title} - ${ps[0].artist}`
          )}
        />
      </box>
    ) : (
      "Nothing Playing"
    ))}
  </box>
}
