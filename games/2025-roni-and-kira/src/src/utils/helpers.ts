export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);

export const qs = (target: HTMLElement, query = "") => {
  return target.querySelector(query);
};

export const qsa = (target: HTMLElement, query = "") => {
  return target.querySelectorAll(query);
};

export const $on = (
  target: HTMLElement | (Window & typeof globalThis),
  type: any,
  callback: (this: HTMLElement, ev: any) => any,
  options?: AddEventListenerOptions
) => target?.addEventListener(type, callback, options);

export const setHtml = (element: HTMLElement | null, html: string) => {
  if (element) {
    element.innerHTML = html;
  }
};

export function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value as T));
}

export const addClass = (target: HTMLElement, className = "") => {
  if (target) {
    className.split(" ").forEach((classText) => {
      target.classList.add(classText);
    });
  }
};

export const removeClass = (target: HTMLElement, className = "") => {
  if (target) {
    className
      .split(" ")
      .forEach((classText) => target.classList.remove(classText));
  }
};

export const hasClass = (target: HTMLElement, className = "") =>
  target.classList.contains(className);

export const setCssVariable = (
  target: HTMLElement,
  variable = "",
  value = ""
) => target.style.setProperty(`--${variable}`, value);

export const addStyle = (
  target: null | HTMLElement,
  styles: Record<string, string>
): void => {
  if (target) {
    for (const style in styles) {
      target.style[style as any] = styles[style];
    }
  }
};

export const inlineStyles = (styles: Record<string, string>) =>
  Object.keys(styles).length
    ? `style='${Object.keys(styles)
        .map((v) => `${v}:${styles[v]}`)
        .join(";")}'`
    : "";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isValidJson = (json = "") => {
  try {
    JSON.parse(json);
    return true;
  } catch (_) {
    return false;
  }
};

export function isValidNumber(value: number | string): boolean {
  return (
    (typeof value === "number" || typeof value === "string") &&
    !isNaN(value as any)
  );
}

export const shareLink = (data: ShareData) => {
  if ("share" in navigator) {
    navigator.share(data);
  } else {
    window.open(
      `https://x.com/share?url=${encodeURIComponent(data.url || "")}`,
      "_blank"
    );
  }
};

export function isFirefoxBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("firefox") && !ua.includes("seamonkey");
}
