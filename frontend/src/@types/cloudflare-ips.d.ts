declare module 'cloudflare-ips' {
  const cloudflareIps: {
    isCloudflare(ip: string): boolean;
  };
  export default cloudflareIps;
}
