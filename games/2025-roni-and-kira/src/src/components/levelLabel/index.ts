import "./styles.css";
import { $, setHtml } from "../../utils/helpers";

class LevelLabel {
  render() {
    return /*html*/ `<div class="p-le">Level <span></span></div>`;
  }

  updateLabel(levelNumber = 0) {
    const element = $(".p-le span") as HTMLElement;

    if (element) {
      setHtml(element, `${levelNumber}`);
    }
  }
}

export default LevelLabel;
