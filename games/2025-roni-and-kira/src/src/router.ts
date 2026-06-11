import {
  BASE_HEIGHT,
  BASE_WIDTH,
  CUSTOM_ROUTER_EVENT_NAME,
  EVENT_TYPE,
  GAME_LABEL_ATTRIBUTE,
  ROUTER_COMPONENT,
  ROUTER_PAGE,
} from "./utils/constants";
import type { NavigateDetail } from "./interfaces";

class AppRouter extends HTMLElement {
  private currentPage: HTMLElement | null = null;

  connectedCallback() {
    // Página por defecto
    this.navigate(ROUTER_PAGE.LOBBY);

    window.addEventListener(CUSTOM_ROUTER_EVENT_NAME, (e: Event) => {
      const customEvent = e as CustomEvent<NavigateDetail>;
      this.navigate(customEvent.detail.page, customEvent.detail.params);
    });

    document.addEventListener(
      EVENT_TYPE.CONTEXT_MENU,
      (e) => e.preventDefault(),
      false
    );

    window.addEventListener(EVENT_TYPE.RESIZE, () => this.applyZoom());
    this.applyZoom();
  }

  applyZoom() {
    const zoomX = window.innerWidth / BASE_WIDTH;
    const zoomY = window.innerHeight / BASE_HEIGHT;
    const zoom = Math.min(zoomX, zoomY);

    // Apply zoom directly
    this.style.zoom = `${zoom}`;
  }

  private navigate(page: string, params: Record<string, any> = {}) {
    if (this.currentPage) {
      this.removeChild(this.currentPage);
    }

    let element: HTMLElement;

    switch (page) {
      case ROUTER_PAGE.LOBBY:
        element = document.createElement(ROUTER_COMPONENT.LOBBY);
        break;
      case ROUTER_PAGE.LEVEL_SELECT:
        element = document.createElement(ROUTER_COMPONENT.LEVEL_SELECT);
        break;
      case ROUTER_PAGE.GAME:
        element = document.createElement(ROUTER_COMPONENT.GAME);
        if (params.level) {
          element.setAttribute(GAME_LABEL_ATTRIBUTE, String(params.level));
        }
        break;
      default:
        element = document.createElement(ROUTER_COMPONENT.LOBBY);
    }

    this.appendChild(element);
    this.currentPage = element;
  }
}

customElements.define(ROUTER_COMPONENT.ROUTER, AppRouter);
