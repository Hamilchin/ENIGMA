declare module "*.jpg";
declare module "*.png";
declare const c2d;

declare module "*.png?inline" {
  const src: string;
  export default src;
}
