import "./styles.css";
import { $on, qs, qsa, setHtml } from "../../utils/helpers";
import { navigate } from "../../utils/navigate";
import { savePropierties } from "../../utils/storage";
import {
  EVENT_TYPE,
  LOCAL_STORAGE_KEY,
  ROUTER_COMPONENT,
  ROUTER_PAGE,
} from "../../utils/constants";
import {
  getCurrentLevelFromCache,
  getSelectedLevel,
  getTotalLevels,
} from "../../levels";
import ButtonGame from "../../components/button";
import template from "./template.html?raw";

// Número total de niveles disponibles
const TOTAL_LEVELS = getTotalLevels();

/**
 *
 * Representa la pantalla de selección de niveles.
 */
class LevelSelect extends HTMLElement {
  private completedLevel = 0;
  private selectedLevel = 0;

  connectedCallback() {
    // Renderiza el template base
    this.innerHTML = template;

    // El número dle nivel que ya se ha completado...
    this.completedLevel = getCurrentLevelFromCache();

    // El nivel que se ha seleccionado actualmemte...
    this.selectedLevel = getSelectedLevel();

    // Contenedor donde van los botones de niveles
    const container = qs(this, ".pag-s") as HTMLElement;

    // Wrapper para insertar elementos adicionales como el botón "Back"
    const wrapper = qs(this, ".pag-c") as HTMLElement;

    // Inserta dinámicamente los botones de los niveles
    setHtml(container, this.renderLevels());

    // Agrega eventos a cada botón de nivel
    qsa(this, ".button").forEach((button) => {
      const numLevel = +button.textContent!;

      if (numLevel - 1 <= this.completedLevel) {
        $on(button as HTMLElement, EVENT_TYPE.CLICK, () => {
          // Se navega a la página del juego pasando el índice del nivel
          savePropierties(LOCAL_STORAGE_KEY.SELECTED, numLevel - 1);
          navigate(ROUTER_PAGE.GAME, { level: numLevel - 1 });
        });
      }
    });

    // Botón "Back" para regresar al lobby
    const backButton = new ButtonGame(
      "back",
      "Back",
      () => navigate(),
      "left: 175px;top: 71px;"
    );

    // Inserta el botón en el wrapper y activa su evento
    wrapper.insertAdjacentHTML("beforeend", backButton.render());
    backButton.event();
  }

  /**
   * Renderiza todos los botones de niveles.
   * @returns {string} HTML con los botones numerados de 1 a TOTAL_LEVELS
   */
  renderLevels(): string {
    return new Array(TOTAL_LEVELS)
      .fill(null)
      .map(
        (_, index) =>
          /*html*/ `<button class="button df jc ai ${
            this.selectedLevel === index ? "active" : ""
          }" ${index > this.completedLevel ? "disabled" : ""}>${
            index + 1
          }</button>`
      )
      .join("");
  }
}

customElements.define(ROUTER_COMPONENT.LEVEL_SELECT, LevelSelect);
