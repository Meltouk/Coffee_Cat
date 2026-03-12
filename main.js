// ------------------- ESCENA INICIO -------------------
class Inicio extends Phaser.Scene {
  constructor() {
    super("Inicio");
  }

  preload() {
    this.load.image("fondoInicio", "../img/fondo.jpeg");
    this.load.image("boton", "../img/boton.png");
  }

  create() {
    let fondo = this.add.image(450, 300, "fondoInicio");
    fondo.setDisplaySize(900, 600);

    let boton = this.add
      .image(450, 450, "boton")
      .setScale(0.5)
      .setInteractive();

    this.add.text(395, 440, "COMENZAR", {
      fontSize: "23px",
      color: "#000000",
    });

    boton.on("pointerdown", () => {
      this.scene.start("Juego");
    });
  }
}

// ------------------- ESCENA JUEGO -------------------
class Juego extends Phaser.Scene {
  constructor() {
    super("Juego");
  }

  preload() {
    this.load.image("raspado", "../img/Rascar1.jpg");
    this.load.image("brush", "../img/boton_60.png");

    this.load.image("helado1", "../img/cake_frutal.jpg");
    this.load.image("helado2", "../img/pan_cereza.jpg");
    this.load.image("helado3", "../img/pan_relleno.jpg");
    this.load.image("helado4", "../img/chocolate.jpg");
  }

  create() {
    this.premios = ["helado1", "helado2", "helado3", "helado4"];
    this.resultados = [];
    this.tarjetas = [];
    this.descubiertas = 0;

    // contador circular
    this.grafica = this.add.graphics();
    this.textoPorcentaje = this.add.text(430, 70, "0%", {
      fontSize: "28px",
      color: "#ffffff",
    });

    let posiciones = [200, 450, 700];

    for (let i = 0; i < 3; i++) {
      let premio = Phaser.Utils.Array.GetRandom(this.premios);
      this.resultados.push(premio);

      this.add.image(posiciones[i], 350, premio).setScale(0.5);

      let rtX = posiciones[i] - 100;
      let rtY = 250;

      let rt = this.add.renderTexture(rtX, rtY, 200, 200).setOrigin(0, 0);

      let capa = this.make.image({
        x: 100,
        y: 100,
        key: "raspado",
        add: false,
      });
      capa.setDisplaySize(200, 200);
      rt.draw(capa);

      this.tarjetas.push({
        rt: rt,
        x: rtX,
        y: rtY,
        porcentaje: 0,
        descubierta: false,
      });
    }

    this.monedaVisual = this.add
      .image(0, 0, "brush")
      .setDepth(100)
      .setVisible(false);

    this.input.on("pointerdown", (pointer) => {
      this.monedaVisual.setPosition(pointer.x, pointer.y);
      this.monedaVisual.setVisible(true);
    });

    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        this.monedaVisual.setPosition(pointer.x, pointer.y);
        this.monedaVisual.setVisible(true);

        this.tarjetas.forEach((t) => {
          if (t.descubierta) return;

          let localX = pointer.x - t.x;
          let localY = pointer.y - t.y;

          if (localX > 0 && localX < 200 && localY > 0 && localY < 200) {
            t.rt.erase("brush", localX - 30, localY - 30);
            t.porcentaje += 0.5;
            this.actualizarCirculo(t.porcentaje);

            if (t.porcentaje > 70) {
              t.descubierta = true;
              t.rt.destroy();
              this.descubiertas++;

              if (this.descubiertas === 3) {
                this.verificarPremio();
                this.monedaVisual.setVisible(false);
              }
            }
          }
        });
      }
    });

    this.input.on("pointerup", () => {
      this.monedaVisual.setVisible(false);
    });
  }

  actualizarCirculo(p) {
    this.grafica.clear();
    this.grafica.lineStyle(10, 0x00ff00);
    this.grafica.beginPath();
    this.grafica.arc(
      450,
      80,
      40,
      Phaser.Math.DegToRad(270),
      Phaser.Math.DegToRad(270 + p * 3.6),
      false,
    );
    this.grafica.strokePath();
    this.textoPorcentaje.setText(Math.floor(p) + "%");
  }

  verificarPremio() {
    let mensaje = "";
    if (
      this.resultados[0] === this.resultados[1] &&
      this.resultados[1] === this.resultados[2]
    ) {
      mensaje = "🎉 GANASTE 🎉";
    } else {
      mensaje = "😢 Intenta otra vez";
    }
    this.add.text(250, 190, mensaje, {
      fontSize: "40px",
      color: "#ffff00",
    });
    this.botonReiniciar();
  }

  botonReiniciar() {
    let boton = this.add
      .text(300, 520, "JUGAR OTRA VEZ", {
        fontSize: "32px",
        backgroundColor: "#00aa00",
        padding: 10,
      })
      .setInteractive();

    boton.on("pointerdown", () => {
      this.scene.restart();
    });
  }
}

// ------------------- CONFIGURACION -------------------
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  backgroundColor: "#ffb6c1",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  parent: "game",
  scene: [Inicio, Juego],
};

const game = new Phaser.Game(config);