# BLACK CAT - NINE LIVES NO MERCY

## STORY

You are special operator, codename Black-Cat. You have been assigned by high command to proceed with all possible haste (stopping only to fiddle with catnip-mice and balls of wool) to the Pyrasian system, where the native Pyra's claim they are being harrassed by the forces of some bad guy that we can't even remember the name of. Liberate the Pyra's special operator Black-Cat, and destroy your enemies, although they may just be innocent space explorers. We don't know for sure but let's err on the side of caution and crush them with paws of steel.

## CONTROLS

Move the mouse to look around and aim.

Forward thrust using the `W` key.

Reverse thrust forward using the `S` key.

Strafe left using the `A` key.

Strafe right using the `D` key.

Land and dust-off using the `E` key.

Press `Left mouse button` to shoot.

Press `Right mouse button` to bomb.

All keyboard controls can be reconfigured in the options menu and will be persisted between games.

## HOW TO PLAY

The main goals of the game are to fly about procedurally generated landscapes, rescuing Pyra, destroying enemy units, and collecting cargo.

You can just checkout the ingame tutorial if you've already grown tired of reading this giant wall of text.


## ENEMY UNITS

There are multiple enemy units, each with their own behaviors:

#### TURI

Stationary turrets that target and shoot at the player. Turi can only be bombed, they cannot be shot.

#### BOTA

Marine units that patrol water and fire flak shells when the player draws near. BOTA can also only be bombed.

#### DART

Flying enemies that periodically shoot in the direction they are travelling. Darts can only be shot.

#### TRIA

Carrier unit that spawn smaller, explosive enemies (Qubi). Tria can only be shot.

#### QUBI

A small unit that slows to a stationary position and explodes after an amount of time. Qubi can only be shot.

#### PROWLER
Intelligent hunters that track and engage the player. Prowlers can only be shot.

## POWERUPS

Turi and Bota have a chance to spawn one of several crates of cargo when they are destroyed:

#### LIFE

An extra life, because sometimes nine lives just aren't enough.

#### POINTS

Bonus points.

#### SHIELDS

A set of orbiting plates that absorb hits.

#### WINGMEN

Two small additional ships that fly in formation and add to your firepower.

#### HORNETS 

Homing missiles that automatically seek out ground targets.

#### LASER

A powerful (but limited use) weapon that auto-targets and destroys flying enemies.

## ABOUT

BLACK CAT - NINE LIVES, NO MERCY is an ambitious feature-rich 3rd-person, 3D vector-graphics shoot-em-up (shmup).

The player pilots a futuristic combat craft across procedurally generated alien landscapes. The visual aesthetic is built on wireframe models rendered in WebGL for a retro-futuristic feel.

BLACK CAT - NINE LIVES, NO MERCY features:

#### CUSTOM GRAPHICS ENGINE

The game is rendered entirely using WebGL to draw lines and triangles, with three layers, one for rendering game objects, one for particles, and one for UI elements. The engine does all of this at 60FPS and in a high resolution of 1920x1080.

The engine is capable of drawing many thousands of lines and triangles, and has a small enough footprint to be used in many other games that make use of line  graphics.

Finally, the engine includes an integrated lightweight User Interface subsystem.

Post competition, the engine will be extracted and have it's own repository.

#### PROCEDURAL TERRAIN GENERATION

Each level's map is generated on the fly using an SVG turbulence filter combined with a circular height reduction algorithm, creating varied landscapes of water, sand, grass, and mountains.

#### PERSISTENT OPTIONS

The player can configure keybaord controls which persist between games.

Highscores also persist between games also.

#### TUTORIAL

A relatively complete tutorial is baked into the game and covers controls, each enemy unit type, the main game objective, and some cargo.

#### CUSTOM BUNDLER

This year I got my custom bundler pretty much 100% working, and published it to it's own repository. Being able to minify and pack an entire JS13K submission with minimal futzing is such a boon.

The bundler is based on JS13K-Pack by Xem.

#### NLNM EDITOR

I had to create a basic 3D modeling application to edit the mdifferent models used in the game. I leveraged Gemini Pro and Claude AI agents to help me with this.

The model editor is included in the games GitHub repository.

## NOTES

BLACK CAT - NINE LIVES, NO MERCY is the spiritual successor of SOS, my first ever JS13K game.

There were a bunch of features that couldn't be added to the game due to size and time constraints:

- Rolling. Game objects can pitch and yaw, but not roll. This would have added that little bit of extra graphical juice.

- Cut scenes featuring the protagonist and their interactions with their commander, a gruff old war dog, Major grumbles.

- More rounded tutorial with detailed information on each enemy unit, and better explanations for the cargo, including others that were not mentioned.

- Music! A pumping fretic shooter anthem, and a suitably "spacey" tune for the menus.

- Menu planetry cloud cover, and also some shading to give the planet more of a realistic look.
