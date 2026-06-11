# Edgar’s Mission

This repository hosts my submission for https://js13kgames.com/ for 2025.

There are several versions of the game:
* Official version: https://js13kgames.com/2025/games/edgars-mission
* Development version: https://schnark.github.io/js13kgames-2025/
* Minified version: https://schnark.github.io/js13kgames-2025/min/

**Some notes about the design:**

Most platformers treat the player just as one point. The image for the player is larger, but either you are on a platform or you are not. This works well for any body where the feet are near each other at any time, but a cat viewed from the side is much larger. So this platformer works with two points, which makes movement more natural and more difficult. There are three modes:

**Walking:** When both points are on the ground or a platform, moving just changes the x-coordinates, the y-coordinates are calculated to keep the player on the current curve. When you hit an obstacle or the border of the level you just stop, when you run into the end of a platform one point loses contact, when you jump both points lose contact.

**Flying:** When neither point is on the ground or a platform you are flying. When you just recently left the ground you can jump, and in any case gravity applies. The current velocity is applied to both points, additionally you rotate to adapt to the direction in which you jump. When you hit an obstacle from below you stop in the vertical direction, when you hit one from the side you stop in the horizontal direction and also regain the ability to jump. When you hit something from above, you get locked to that curve.

**Sliding:** The most difficult mode is the case when one point is locked to a curve, and the other one is free. In this case the free point moves like flying, while the other one is moved on the curve trying to keep the correct distance.

Technically, the cat is just a rectangle (with slighly varying length and more or less arbitrary height), and this was exactly the placeholder in the early prototypes of the game. The actual cat is just drawn into this rectangle, and there is https://schnark.github.io/js13kgames-2025/test-cat.html to test the design of the cat.

For level design there is https://schnark.github.io/js13kgames-2025/test-levels.html which allows direct selection of a level, shows the position, disables death, and most importantly allows reloading an updated level while keeping the current position of the cat.

For music and sound I used my own library from previous years, to test the music there is https://schnark.github.io/js13kgames-2025/test-audio.html. The music is based on <i>Peter and the Wolf</i> by Sergei Prokofiev.

**Some hints on how to solve the levels:**

* Level 1–5: Just follow the hints.
* Level 6: Follow the obvious path, do not fall into the gap.
* Level 7: This is very similar to level 5, you just have to jump, too. Don’t jump to high, to make sure you are on the ground and in the shadow when a drone passes over you. Note that there is some safe room between the first and the second shadow.
* Level 8: Just follow the obvious path. Fall down from the third platform (you ca’n’t jump over the thorns), and reach the top of the fifth platform by multiple jumps. Take some run-up and jump to the end of the level.
* Level 9: The jumps are quite difficult. The first lake is so large that the longest possible jump will be just enough to safely reach the other side. Keep running when your front paws hit the other side. The second lake is a bit shorter, but you have to avoid the drone. Wait in the shadow and start running when the drone is above you. Don’t start too early or too late. The third lake is as long as the first, so you know you can do it.
* Level 10: Don’t worry too much about the thorns above you. Collision detection on the top isn’t exact, so you can touch them a bit; the first two are so high above you will not hit them anyway. Pass the first obstacle by jumping just in front of it, the second one with a bit more way before it. Your last jumps must be gentle, not too long and not too high.
* Level 11: There are three shadows, but no obstacles on the ground. Just keep going when the sky is clear. Immediately go for the first shadow. When the two drones have passed over you from right to left, run for the second shadow. Wait a bit and follow the two drones flying to the right to the third shadow. The last part is passed over by a very fast drone. Wait until the other drones are somewhere else and that fast drone is turning to the right, then follow it to the end of the level.
* Level 12: Some of the jumps are difficult. Take as much run-up as possible and jump in the last moment. If you hit the next platform with your front paws only just keep going or try a little jump to reach the platform.
* Level 13: As the hint says: RUN! The drone is almost as fast as you, there are no shadows to hide in. Note that for most jumps you need all your paws on the ground. You might need to stop briefly to do so, but most of the time you should be running. Good luck.