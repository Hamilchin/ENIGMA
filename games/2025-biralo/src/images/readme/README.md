# How to name the image files

All the images from ./images/export/\*.png will be auto converted to RLE compitable version in ./media/\*.js

See More info on RLE here:
[https://github.com/smiley405/RLE-sprite-editor](https://github.com/smiley405/RLE-sprite-editor)

**Example 1:**
<br>>> images/export/ui/corn_static_icon,w16,h16,s1.png
<br>Syntax:
<br>**{file_name,frameWidth,frameHeight,fps}.png**
<br>w = frameWidth = w16 [ Must start with letter 'w' ]
<br>h = frameHeight = h16 [ Must start with letter 'h' ]
<br>s = fps = 1 [ Must start with letter 's', fps is optional ]
<br>
<br>

**Note::**
<br>[1] File name should be Snake Case i.e uses an underscore (_). Example, file_name, last_name, my_file_rocks.
<br>[2] The file_name will be the variable name.
<br>[3] Any sub-directores will be concated together & the variable name will be in Snake case in uppercase.
<br>
<br>This is how it looks inside the auto converted file:
<br>>> media/uiAssets.js
<br>

```
export const CORN_STATIC_ICON = {
  w: 16,
  h: 16,
  frames: '......',
  palette: '......',
  fps: 1,
};
```

**Example 2:**
<br>>> images/export/enemies/thor/run,w8,h8,s8.png
<br>This is how it looks inside a auto converted file:
<br>>> media/enemiesThorAssets.js
<br>

```
export const THOR_RUN = {
  w: 8,
  h: 9,
  frames: '......',
  palette: '......',
  fps: 8,
};
....
....
```

You can see the differences here /images/export/\*.png & /media/\*.js

**Tips::**
<br>
I use grafx2 as my main art program and use [spritesheet-viewer](https://github.com/smiley405/spritesheet-viewer) to play the animation and export the spritesheets.

Use [spritesheet-viewer](https://github.com/smiley405/spritesheet-viewer) to view, play the animation and to export the selected frames to spritesheet. I wrote this tool specifically for this purpose.

**How to use spritesheet-viewer:**
<br>- First clone the [spritesheet-viewer](https://github.com/smiley405/spritesheet-viewer)
<br>- In the terminal -> npm run dev
<br>- Read the help-page.
<br>
<br>- Open the menu,
<br>- Load the sprites.gif from images/grafx2/sprites.gif
<br>
<img src="/images/readme/spritesheet-viewer-1.png">
<br>
<br>- Set the required grid dimensions, eg. width: 8, height: 8 and hit 'OK' button
<br>- Select the frame, set animation speed from the menu
<br>
<img src="/images/readme/spritesheet-viewer-2.png">
<br>
<br>- Go to Export, set filename,
<br>- Click Suffix List,
<br>- Click 'Grid width', 'Grid height', 'fps'
<br>- and you will see suffix: ,w{w},h{h},s{s}
<br>- where w = frame width,
<br>- where h = frame height,
<br>- where s = animation speed in fps,
<br>- Set filetType options to "SpriteSheet"
<br>- Finally, after that click 'OK' to export
<br>- It's that easy!
<br>
<img src="/images/readme/spritesheet-viewer-3.png">
