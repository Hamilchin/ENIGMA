import "./styles.css";
import { $, $on, qs, setHtml, shareLink } from "../../utils/helpers";
import { getCurrentLevelFromCache, getTotalLevels } from "../../levels";
import { navigate } from "../../utils/navigate";
import {
  ESounds,
  EVENT_TYPE,
  ROUTER_COMPONENT,
  ROUTER_PAGE,
} from "../../utils/constants";
import {
  getLabelButtonSound,
  PlaySound,
  toogleSounds,
} from "../../utils/sounds";
import ButtonGame from "../../components/button";
import template from "./template.html?raw";

// Total de niveles disponibles en el juego
const TOTAL_LEVELS = getTotalLevels();

/**
 * Representa la pantalla de inicio o lobby del juego.
 */
class Lobby extends HTMLElement {
  connectedCallback() {
    // Renderiza el template base del lobby
    this.innerHTML = template;

    // Referencias a los elementos clave dentro del template
    const startBtn = qs(this, "button") as HTMLElement; // Botón "Play"
    const labelLevel = qs(this, ".lob-l span") as HTMLElement;
    const completedLevel = getCurrentLevelFromCache();

    // Actualiza el label para mostrar progreso: "niveles completados / total"
    setHtml(labelLevel, `${completedLevel}/${TOTAL_LEVELS}`);

    // Agrega evento al botón para navegar a la página de selección de niveles
    $on(startBtn, EVENT_TYPE.CLICK, () => navigate(ROUTER_PAGE.LEVEL_SELECT));

    // Para el botón share del juego...
    const shareButton = new ButtonGame(
      "share",
      "Share",
      () =>
        shareLink({
          title: "😺 Roni and Kira",
          text: "Play Roni & Kira, A JS13k Game by Jorge Rubiano!",
          url: window.location.href,
        }),
      "top: 60px;left:60px;"
    );

    const soundButton = new ButtonGame(
      "sound",
      getLabelButtonSound(),
      () => {
        toogleSounds($("#btn-sound") as HTMLButtonElement);
        PlaySound(ESounds.CLICK);
      },
      "top: 60px;right: 60px;left:unset;"
    );

    // Wrapper para insertar elementos adicionales...
    const wrapper = qs(this, ".pag-c") as HTMLElement;

    wrapper.insertAdjacentHTML("beforeend", soundButton.render());
    wrapper.insertAdjacentHTML("beforeend", shareButton.render());
    soundButton.event();
    shareButton.event();
  }
}

customElements.define(ROUTER_COMPONENT.LOBBY, Lobby);
