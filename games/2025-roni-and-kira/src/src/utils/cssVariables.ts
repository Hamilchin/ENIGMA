import { BASE_HEIGHT, BASE_WIDTH } from "./constants";
import { setCssVariable } from "./helpers";

setCssVariable(document.documentElement, "bh", `${BASE_HEIGHT}px`);
setCssVariable(document.documentElement, "bw", `${BASE_WIDTH}px`);
