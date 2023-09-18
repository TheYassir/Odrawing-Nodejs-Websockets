const socket = io();

const app = {
  init() {
    console.log("app.init !");
    app.toolbox = document.querySelector("#toolbox");
    // On initialise les valeurs par défaut
    app.changeConfigValue();
    app.addEventListeners();
    app.addWsEventListeners();
  },

  wsConnected(message) {
    console.log("Connected to websocket server : ", message);
    app.wsState = "connected";
    app.createCursor({ userId: socket.id });
  },

  createCursor({ userId }) {
    const cursor = document.createElement("div");
    cursor.classList.add("cursor");
    cursor.id = `cursor-${userId}`;
    // cursor.textContent = userId;
    document.body.appendChild(cursor);
    return cursor;
  },

  moveCursor({ userId, x, y }) {
    let cursor = document.querySelector(`#cursor-${userId}`);
    if (!cursor) {
      cursor = app.createCursor({ userId });
    }
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  },

  mouseMoveHandler(event) {
    const { pageX: x, pageY: y } = event;
    // socket.emit('mouseMove', { x, y });
    app.moveCursor({ userId: socket.id, x, y });
    socket.emit("mouseMove", { x, y });
  },

  addEventListeners() {
    app.toolbox.addEventListener("input", app.changeConfigValue);
    document.addEventListener("mousemove", app.mouseMoveHandler);
  },

  userDisconnected({ userId }) {
    const cursor = document.querySelector(`#cursor-${userId}`);
    if (cursor) {
      cursor.remove();
    }
  },

  addWsEventListeners() {
    socket.on("draw", app.draw);
    socket.on("mouseMove", app.moveCursor);
    socket.on("userDisconnected", app.userDisconnected);
  },

  changeConfigValue() {
    app.strokeColor = document.querySelector("#strokeColor").value;
    app.strokeWeight = document.querySelector("#strokeWeight").value;
  },

  p5Setup() {
    app.canvas = createCanvas(600, 500);
    app.canvas.parent("canvas");
    console.log(app.canvas);
    background(255);
  },

  p5Draw() {
    // On ne peut dessiner qu'a partir du moment ou on est connecté au serveur websocket
    if (app.wsState) {
      // background(255, 0, 255);
      if (mouseIsPressed) {
        const drawData = {
          mouseX,
          mouseY,
          pmouseX,
          pmouseY,
          color: app.strokeColor,
          weight: app.strokeWeight,
        };
        app.draw(drawData);
        socket.emit("draw", drawData);
      }
    }
  },

  draw({ mouseX, mouseY, pmouseX, pmouseY, color, weight, userId }) {
    if (userId) {
      const cursor = document.querySelector(`#cursor-${userId}`);
      if (cursor) {
        cursor.style.backgroundColor = color;
      }
    }
    stroke(color);
    strokeWeight(weight);
    line(mouseX, mouseY, pmouseX, pmouseY);
  },
};

socket.on("serverMessage", (message) => {
  app.wsConnected(message);
});

document.addEventListener("DOMContentLoaded", app.init);

function setup() {
  app.p5Setup();
}

function draw() {
  app.p5Draw();
}
