/*
    Copyright (c) 2017 Scott Winkelmann

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

// padding between the text lines and border of the canvas
const textPadding = 20;

// where to spawn the stuff (mouse position in this case)
let spawnLocation = null;

// fire object placeholder
let fire = null;
// explosions list
let explosions = [];

// stuff to calculate the frame rate
let lastTime = 0;
let currentTime = 0;
let delta = 0;

function setup()
{
    createCanvas(innerWidth, innerHeight);

    // default spawn location: bottom middle of the screen
    spawnLocation = createVector(width / 2, height - 50);

    //creating the fire (see `particles.js`)
    fire = new Fire(spawnLocation);
    // more stuff to calculate frame rate
    lastTime = millis();
}

function draw()
{
    // calculating frame rate
    currentTime = millis();
    delta = currentTime - lastTime;
    lastTime = currentTime;

    background("#111");

    // updating the lone fire
    fire.update();
    fire.draw();

    // updating all explosion and removing the ones that are done
    for(let i = explosions.length - 1; i >= 0; i--)
    {
        explosions[i].update();

        if(explosions[i].done)
        {
            explosions.splice(i, 1);

            // go to next iteration and ignore the draw call
            continue;
        }

        explosions[i].draw();
    }

    // FPS counter and other usefull text
    fill(240, 200);
    textFont("monospace", 16);
    text("FPS: " + floor(1000 / delta), textPadding, textPadding);
    text("M1 to move the fire", textPadding, textPadding * 2);
    text("M3 to place an explosion", textPadding, textPadding * 3);
}

function mouseReleased()
{
    // on click, spawn location is the location of the cursor
    spawnLocation = createVector(mouseX, mouseY);

    if(mouseButton === CENTER)
    {
        // M3: add a new explosion (see `particles.js`)
        explosions.push(new Explosion(spawnLocation, {maxParticles: 50}));
    }
    else if(mouseButton === LEFT)
    {
        // M1: move the fire to the cursor
        fire.move(spawnLocation);
    }
}
