# Astal configuration

Eternally work in progress.. Currently contains:

- a Niri workspaces implementation (auto detects monitors via Niri as well).
- Laptop stuff (Wifi, brightness, battery)
- Bluetooth & Audio stuff (needs some renaming, currently the menu component is called bluetooth menu)
- Tray
- CPU & Memory usage

## Workspaces (left side of the bar)

![image](https://github.com/user-attachments/assets/622fbbf1-b048-4ba0-af14-baaafdb6bdb8)

Currently there is no Niri implementation yet in Astal, so the way this communicates with Niri is through the IPC in a custom typescript client.
The client is by no means well implemented, and I fully intend to replace it when something better comes out. This has some interesting features
however:

- Displays workspaces as pill/island groups
- Inside of each workspace group, display the index (matches the keybinds that I set up in my niri config, Super+123456789)
- For each application running in a workspace, also display the icon of that application so that I can get an overview of what
  is running where.

## Bar components (right side of the bar)

![image](https://github.com/user-attachments/assets/27f5021e-6fa2-4d30-b12b-2c7a81bfeba6)

The "islands" in the bar are implemented here (from left to right)

- `./widgets/ResourceUsage.tsx`
  
  Displays CPU & Memory usage. It expands on hover or when values reach a certain threshold (when they become interesting to look at). Might add
  network information in the future (current bandwidth usage?). There is some CSS to change the colours when usage increases.
  
- `./widgets/CurrentCluster.tsx`

  Displays the cluster that Kubectl currently points at. Very useful when switching between different clusters frequently. Might decide to move
  this to my terminal prompt at some point, but for now I like it here.

- `./widgets/LaptopStuff.tsx` (not shown in the screenshot)

  Displays Wifi information, as well as battery & brightness percentages. I implemented a flashy animation (literally) when the battery is almost empty.

- `./widgets/AudioBluetooth.tsx`

  Contains bluetooth and audio indicators. I mixed bluetooth and audio settings because I mostly use bluetooth for headphones/headsets. This also serves
  as a button to open a menu to connect to new devices & switch input sources (very useful for plugging in new microphones during meetings).

- `./widgets/Tray.tsx`

  The tray is pretty much copied from the Astal example, I didn't really change anything

- `./widgets/DateTime.tsx`

  Displays date & time in the format that I always used since I first started writing dotfiles, also not super interesting

The menu that is opened by the AudioBluetooth island button is implemented in `./windows/BluetoothMenu.tsx` (10/10 naming). What is interesting is that it
also uses Upowerd (the battery observer daemon used mostly on laptops) on my desktop (no battery) to keep track of battery levels of bluetooth devices.
It can then display that (if available) in the menu as well which is super useful. I really want to replace that window with a GtkPopover so that I don't
have to position it to the top-right of my screen, and can instead align it to the button widget that opens it. But alas, I tried to get popovers to work
for 10 minutes and failed, so I will wait until someone else does this in gtk3 typescript.

## Future module ideas

- Google calendar thing (would have to write a google oauth client in Vala probably) to display upcoming meetings
- Something to keep track of tickets maybe
- Gitlab merge request list (stuff where I am asked for a review)
