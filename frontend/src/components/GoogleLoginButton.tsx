"use client";
import { useEffect} from "react";

export default function GoogleLoginButton({ ready }: { ready: boolean }) {
  useEffect(() => {
    if (!ready) return;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: google.accounts.id.CredentialResponse) => {
        await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleToken: response.credential,
          }),
        });
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-btn")!,
      { theme: "outline", size: "large" }
    );
  }, [ready]);

  return <div id="google-btn" />;
}
