export {};

declare module '*.css' {
  const content: {};
  export default content;
}

declare global {
  interface Window {
    google: any;
  }
  var redis: Redis | undefined;
}
