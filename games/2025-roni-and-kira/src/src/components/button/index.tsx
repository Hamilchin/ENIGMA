import "./styles.css";
import { $, $on } from "../../utils/helpers";
import { EVENT_TYPE } from "../../utils/constants";

class ButtonGame {
  private type = "";
  private id = "";
  private label = "";
  private style = "";
  private cb: () => void = () => {};

  constructor(type = "", label = "", cb = () => {}, style = "") {
    this.type = type;
    this.label = label;
    this.style = style;
    this.cb = cb;
    this.id = `btn-${this.type.toLowerCase()}`;
  }

  render() {
    return /*html*/ `<button id="${this.id}" class="btg button" ${
      this.style ? `style="${this.style}"` : ""
    }>${this.label}</button>`;
  }

  event() {
    $on($(`#${this.id}`) as HTMLElement, EVENT_TYPE.CLICK, () => this.cb());
  }
}

export default ButtonGame;
