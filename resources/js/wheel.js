document.addEventListener("DOMContentLoaded", () => {
    const colors = ["#ff7600", "#ffa900", "#DC1C1A", "#00ff42", "#52006a", "#5844cf"];
    const playerMenu = document.querySelector("#players");
    const elSpin = document.querySelector("#spin");
    const result = document.querySelector("#result");
    const latestPlayer = document.querySelector("#latestPlayer");
    const ctx = document.querySelector("#wheel").getContext("2d");
    const dia = ctx.canvas.width;
    const rad = dia / 2;
    const PI = Math.PI;
    const TAU = 2 * PI;
    let numPlayers = 0;
    const friction = 0.991;
    const angVelMin = 0.002;
    let angVelMax = 0;
    let angVel = 0;
    let ang = 0;
    let isSpinning = false;
    let isAccelerating = false;
    let animFrame = null;

    function createPlayerElement(value) {
        const li = document.createElement("li");
        li.className = "playerWithRemove";

        const span = document.createElement("span");
        span.className = "player";
        span.textContent = value.toString();

        const a = document.createElement("a");
        a.className = "removePlayer";
        a.textContent = "×";
        a.addEventListener("click", () => removePlayer(li));

        li.appendChild(span);
        li.appendChild(a);

        return li;
    }

    function removePlayer(playerElement) {
        const playerIndex = Array.from(playerMenu.querySelectorAll(".playerWithRemove")).indexOf(playerElement);
        if (playerIndex !== -1) {
            playerMenu.removeChild(playerElement);
            defaultPlayerValues.splice(playerIndex, 1);
            numPlayers--;
            ctx.clearRect(0, 0, dia, dia);
            defaultPlayerValues.forEach((value, i) => {
                drawSector(colors[i], value, i);
            });
            rotate();
        }
    }

    function addPlayerToListAndWheel(value) {
        const playerElement = createPlayerElement(value);
        playerMenu.appendChild(playerElement);
        defaultPlayerValues.push(value);
        numPlayers++;
        ctx.clearRect(0, 0, dia, dia);
        defaultPlayerValues.forEach((value, i) => {
            drawSector(colors[i], value, i);
        });
        rotate();
    }

    function drawSector(color, value, i) {
        const ang = TAU / numPlayers;
        ctx.save();
        //color
        const colorIndex = i % colors.length;
        ctx.beginPath();
        ctx.fillStyle = colors[colorIndex];
        ctx.moveTo(rad, rad);
        ctx.arc(rad, rad, rad, ang * i, ang * (i + 1));
        ctx.lineTo(rad, rad);
        ctx.fill();
        //text
        ctx.translate(rad, rad);
        ctx.rotate(ang * (i + 0.5));
        ctx.textAlign = "right";
        ctx.fillStyle = "#f5f5f5";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(value.toString(), rad - 10, 10);
        ctx.restore();
    }

    //rotate 
    function rotate() {
        const index = Math.floor(numPlayers - ang / TAU * numPlayers) % numPlayers;
        const value = defaultPlayerValues[index];
        if (value) {
            const color = colors[index];
            ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
            elSpin.textContent = !angVel ? "SPIN" : value.toString();
            elSpin.style.background = color;
            result.textContent = value.toString();
            latestPlayer.textContent = `Latest winner: ${value}`;
        }
    }

    const frame = () => {
        if (!isSpinning) return;

        if (angVel >= angVelMax) isAccelerating = false;

        if (isAccelerating) {
            angVel ||= angVelMin;
            angVel *= 1.06;
        } else {
            isAccelerating = false;
            angVel *= friction;

            if (angVel < angVelMin) {
                isSpinning = false;
                angVel = 0;
                cancelAnimationFrame(animFrame);
            }
        }

        ang += angVel;
        ang %= TAU;
        rotate();
    };

    const engine = () => {
        frame();
        animFrame = requestAnimationFrame(engine);
    };

    elSpin.addEventListener("click", () => {
        if (isSpinning) return;
        isSpinning = true;
        isAccelerating = true;
        angVelMax = rand(0.25, 0.40);
        engine();
    });

    function rand(m, M) {
        return Math.random() * (M - m) + m;
    }

    const defaultPlayerValues = []; // default prize
    numPlayers = defaultPlayerValues.length;

    const defaultPlayerElements = defaultPlayerValues.map(value => createPlayerElement(value));
    defaultPlayerElements.forEach(playerElement => playerMenu.appendChild(playerElement));

    defaultPlayerValues.forEach((value, i) => {
        drawSector(colors[i], value, i);
    });

    rotate();

    //add button mouse, keyboard
    const addPlayerButton = document.querySelector("#add-player");
    const newPlayerInput = document.querySelector("#new-player");

    newPlayerInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            const newPlayerValue = newPlayerInput.value.trim();

            if (newPlayerValue !== "") {
                addPlayerToListAndWheel(newPlayerValue);
                newPlayerInput.value = "";
            }
        }
    });

    addPlayerButton.addEventListener("click", () => {
        const newPlayerValue = newPlayerInput.value.trim();

        if (newPlayerValue !== "") {
            addPlayerToListAndWheel(newPlayerValue);
            newPlayerInput.value = "";
        }
    });

});