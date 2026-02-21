export {};

declare module "*.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare global {
  interface Window {
    google: unknown;
  }

  var redis: Redis | undefined;
}
