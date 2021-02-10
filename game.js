export {};

/**
 * The more fun example
 */
/** @type {HTMLCanvasElement} */
let canvas = (/** @type {HTMLCanvasElement} */ document.getElementById("canvas"));
let context = canvas.getContext('2d');
// setInterval(animate, 1000 / 30);

let new_enemy_time = 1000;
let last_emeny_time = Date.now();
let width = canvas.width;
let height = canvas.height;
let game_start = false;
let mouseX = -10;
let mouseY = -10;
let now = Date.now();
let e_now = Date.now();
let e_move_time = 10;
let e_delta = 0;

let enemies = [];
let enemy_vx = width/600;
createEnemy();
let cursor = {"x": width/2, "y":height/2}
let bullets = [];
let particles = [];
let startButton = {"x": width/2 - 50, "y": height/2 - 20, "width": 100, "height": 40};
let shooter = {"x": width/2 - 25, "y": height - 50, "width": 50, "height": 40, "r": Math.PI};

let img = new Image(60, 40);
img.src = "enemy.png";


canvas.onmousemove = function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    let box = /** @type {HTMLCanvasElement} */(event.target).getBoundingClientRect();
    mouseX -= box.left;
    mouseY -= box.top;
};
canvas.onmouseleave = function() {
    mouseX = -10;
    mouseY = -10;
};
canvas.onmousedown = function(){
    if( game_start ){
        if(bullets.length < 5){
            let x = shooter.x + shooter.width/2;
            bullets.push({"x": x, "y": shooter.y, "xf": mouseX, "yf": mouseY, "vy": (mouseY - shooter.y)/100, "vx": (mouseX - x)/100, "show": 1});
        }
    } else {
        if( (mouseX < startButton.x + startButton.width) && (mouseX > startButton.x) && (mouseY < startButton.y + height) && (mouseY < startButton.y + startButton.height)){
            game_start = true;
        }
    }
};

/**
 * Draws the start screen of the game
 */
function startScreen(){
    context.rect(startButton.x, startButton.y, startButton.width, startButton.height);   
    context.save();
        context.fillStyle = '#FFF';
        context.fill();
    context.restore();
};

/**
 * Creates an enemy
 */
function createEnemy(){
    enemies.push({"x": 0, "y": 10, "dir": 1,
        "width": 60, "height": 40, "r": Math.PI/2, "show": 1});
}

/**
 * Draws and updates the current game
 */
function gameScreen(){
    /** TIME DELTAS */
    let new_now = Date.now();
    let delta = (now - new_now)/1000;
    now = new_now;

    if( (Date.now()) >= last_emeny_time + new_enemy_time){
        createEnemy();
        last_emeny_time = Date.now();
    }

    /** PLAYER MOVEMENT */
    context.beginPath();
    context.rect(shooter.x, shooter.y, shooter.width, shooter.height);
    context.closePath();
    shooter.x = (Math.sin(shooter.r)+1)/2 * (width-shooter.width);
    shooter.r += delta;//shooter.s;
    context.save();
        context.fillStyle = '#FFF';
        context.fill();
    context.restore();

    /** ENEMY MOVMENT */
    enemies = enemies.filter(
        dot => ((dot.y>0)&&(dot.x>=-1)&&(dot.x<width)&&(dot.y<height) && (dot.show))
    );

    e_delta = Date.now() - e_now;
    // handles the movement drawing and movement of enemies
    enemies.forEach(function(e){
        // checks for collisions with bullets
        bullets.forEach(function(b){
            if((b.y>e.y)&&(b.x>e.x)&&(b.x<e.width+e.x)&&(b.y<e.height+e.y)){
                b.show = 0;
                e.show = 0;
                explode(b.x, b.y, '#F00');
            }
        });

        // draws the enemies
        context.beginPath();
        context.rect(e.x, e.y, e.width, e.height);
        context.closePath();
        //updates the x position of the enemies
        if( e_move_time < e_delta){
            e.x += (enemy_vx*e.dir);
        }
        // updates the y position of the enemie
        if(e.x <= .01 || e.x >= enemy_vx * Math.floor((width-e.width)/enemy_vx)){
            e.y += e.height + 10;
            e.dir = -e.dir;
        }
        e.r += delta;
        // styling
        context.save();
            context.fillStyle = '#0F0';
            context.fill();
        context.restore();
        context.drawImage(img, e.x, e.y, e.width, e.height);
        
    });
    if( e_move_time < e_delta){
        e_now = Date.now();
    }

    /** BULLET MOVEMENT */
    bullets = bullets.filter(
        dot => ((dot.y>0)&&(dot.x>0)&&(dot.x<width)&&(dot.y<height) && (dot.show))
    );

    // handles the movement drawing and movement of bullets
    bullets.forEach(function(b){
        context.beginPath();
        context.arc(b.x, b.y, 3, 0, Math.PI*2);
        // updates the x and y position of the bullet
        b.y += b.vy;
        b.x += b.vx;
        context.closePath();
        // styling
        context.save();
            context.fillStyle = '#F00';
            context.fill();
        context.restore();
    });

    /** PARTICLE MOVEMENT */
    particles = particles.filter(
        dot => ((dot.y>0)&&(dot.x>0)&&(dot.x<width)&&(dot.y<height)&&(dot.a > 0))
        );

    particles.forEach(function(p){
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.g;
        context.beginPath();
        context.arc(p.x, p.y, 2, 0, Math.PI * 2);
        context.closePath();
        context.save();
            context.globalAlpha = p.a;
            context.fillStyle = p.color;
            context.fill();
        context.restore();
        p.a -= 0.02;
        
    });
    
};

/**
 * Creates a small explosion animation
 * @param {*} px - starting x position
 * @param {*} py  - starting y position
 * @param {*} pcolor - color of the particles
 */
function explode(px, py, pcolor){
    for (var i = 0; i < 10; i++){
        let randX = 0;
        let randY = 0;
        while( randX == 0 || randY == 0){
            randX = (Math.random() * 5);
            randY = (Math.random() * 5);
        }
        randX = Math.round(Math.random()) ? randX : -randX;
        randY = Math.round(Math.random()) ? randY : -randY;
        particles.push({"x": px, "y": py, "vx": randX, "vy": randY, "a": 1.0, "g": 0.09,
            "color": pcolor});
    }
}

/**
 * The main animation loop of the program
 */
function animate() {
    // clear the canvas
    context.clearRect(0,0,canvas.width,canvas.height);
    context.fillStyle = "#111";
    context.fillRect(0, 0, width, height);

    // controls which screen is shown
    if(game_start) {
        gameScreen();
    } else {
        startScreen();
    }

    window.requestAnimationFrame(animate);
};
animate();