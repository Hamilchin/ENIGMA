import { CUSTOM_ROUTER_EVENT_NAME, ESounds, ROUTER_PAGE } from "./constants";
import { PlaySound } from "./sounds";

export const navigate = (
  page = ROUTER_PAGE.LOBBY,
  params?: Record<string, any>
) => {
  const detail = { page, params };

  PlaySound(ESounds.CLICK);

  window.dispatchEvent(
    new CustomEvent(CUSTOM_ROUTER_EVENT_NAME, {
      detail,
    })
  );
};
