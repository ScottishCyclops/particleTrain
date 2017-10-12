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

class Particle
{
    /**
     * Creates a new particle
     * @param {p5.Vector} location the location of the particle. default: (0, 0)
     * @param {any} extras any extra parameters. see doc below
     * 
     * @param {number} turbulence the amount of turbulence applied to the particle. default: 0
     * @param {number} fading how fast the particle fades away. default: 1
     * @param {number} diameter the width of the particle in pixels. default: 16
     * @param {number} risingSpeed how fast should the particle rise. default: 0
     * @param {function} colorFunction the function to call with the particle to determine its color. default: null
     * @param {p5.Vector} baseAcceleration the base acceleration of the particle. default: (0, 0)
     */
    constructor(location, extras)
    {
        // make sure extras is not undefined
        extras = extras || {};

        // parameters, with default values
        this.location = location ? location.copy() : createVector(0, 0);
        this.turbulence = extras.turbulence ? extras.turbulence : 0;
        this.fading = extras.fading ? extras.fading : 1;
        this.diameter = extras.diameter ? extras.diameter : 16;
        this.risingSpeed = extras.risingSpeed ? extras.risingSpeed : 0;
        this.colorFunction = extras.colorFunction ? extras.colorFunction : null;
        this.acceleration = extras.baseAcceleration ? extras.baseAcceleration : createVector(0, 0);

        // base values
        this.velocity = createVector(0, 0);
        this.maxAcceleration = 3;
        this.lifetime = 255;
        this.dead = false;
    }

    /**
     * Apply a new force to the particle
     * @param {number} x force on the x axis
     * @param {number} y force on the y axis
     */
    addForce(x, y)
    {
        this.velocity.add(x, y);
    }

    /**
     * Update the particle's position and dead state
     */
    update()
    {
        // add turbulence and rising force
        this.addForce(random(-this.turbulence, this.turbulence), random(-this.turbulence - this.risingSpeed, this.turbulence));

        this.acceleration.add(this.velocity);
        this.acceleration.limit(this.maxAcceleration);
        this.velocity.set(0, 0);
        this.location.add(this.acceleration);

        this.lifetime -= this.fading;

        if(this.lifetime <= 0)
        {
            this.dead = true;
        }
    }

    /**
     * Draw the particle on the canvas
     */
    draw()
    {
        noStroke();
        if(this.colorFunction !== null)
        {
            fill(this.colorFunction(this));
        }
        else
        {
            fill(255, this.lifetime);
        }
        ellipse(this.location.x, this.location.y, this.diameter);
    }
}

class ParticleSystem
{
    /**
     * Creates a particle system
     * @param {p5.Vector} location the location of the system
     * @param {any} extras any extra parameters. see doc below
     * 
     * @param {number} maxParticles the maximum number of particles in the system. default: 100
     */
    constructor(location, extras)
    {
        extras = extras || {};

        this.location = location ? location.copy() : createVector(width / 2, height / 2);
        this.maxParticles = extras.maxParticles ? extras.maxParticles : 100;

        // is the system done ? aka finished
        this.done = false;

        this.particles = [];

        for(let i = 0; i < this.maxParticles; i++)
        {
            this.particles[i] = this.createParticle();
        }
    }

    /**
     * Method called to create a new particle
     * Should be overriden
     */
    createParticle()
    {
        return new Particle(this.location);
    }

    /**
     * Moves the system to the new given location
     * @param {p5.Vector} newLocation new location of the system
     */
    move(newLocation)
    {
        // copy the vector to make sure the original is kept the way it was
        this.location = newLocation.copy();
    }

    /**
     * Update the whole system
     * Can be overriden
     */
    update()
    {
        for(let i = this.particles.length - 1; i >= 0; i--)
        {
            this.particles[i].update();

            if(this.particles[i].dead)
            {
                // remove dead particles
                this.particles.splice(i, 1);
            }
        }

        // if all the particles are gone, we are done
        if(this.particles.length <= 0)
        {
            this.done = true;
        }
    }

    /**
     * Draw the whole system
     */
    draw()
    {
        // OMG, a foreach !
        this.particles.forEach(particle =>
        {
            particle.draw();
        });
    }
}

class Fire extends ParticleSystem
{
    // no constructor: calls the parent's constructor directly

    /**
     * Method called to create a new particle
     * @override
     */
    createParticle()
    {
        return new Particle(this.location,
            {
                turbulence: random(0.2, 0.5),
                fading: random(3, 6),
                diameter: random(10, 15),
                risingSpeed: 1,
                colorFunction: getFireColor
            });
    }

    /**
     * Update the whole system
     * @override
     */
    update()
    {
        for(let i = this.particles.length - 1; i >= 0; i--)
        {
            this.particles[i].update();

            if(this.particles[i].dead)
            {
                // replace dead particles
                this.particles[i] = this.createParticle();
            }
        }

        // the fire is never done burning, so we don't check anything else
    }
}

class Explosion extends ParticleSystem
{
    /**
     * Method called to create a new particle
     * @override
     */
    createParticle()
    {
        return new Particle(this.location,
            {
                turbulence: random(0.6, 1),
                fading: random(4, 9),
                diameter: random(10, 15),
                baseAcceleration: createVector(0, random(10, 15)).rotate(random(TWO_PI)),
                colorFunction: getFireColor
            });
    }
}

/**
 * Given a particle, returns the color it should be drawn with
 * to look like fire
 * @param {Particle} particle 
 */
function getFireColor(particle)
{
    // value between 0 and 1. closer to 0 means the particle was just born. 1 means it should die
    const alpha = 1 - particle.lifetime / 255;

    // smoke color
    let out = "#333";

    if(alpha < 0.5)
    {
        // red
        out = "#d90e0e";
    }

    if(alpha < 0.3)
    {
        // orange
        out = "#ff740e";
    }

    if(alpha < 0.2)
    {
        // yellow
        out = "#ffd800";
    }

    if(alpha < 0.1)
    {
        // white
        out = "#fff";
    }

    // add alpha and return
    return color(red(out), green(out), blue(out), particle.lifetime);
}
