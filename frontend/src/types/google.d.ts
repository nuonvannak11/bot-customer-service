export {};

declare global {
  namespace google {
    namespace accounts {
      namespace id {
        interface CredentialResponse {
          credential: string;
          select_by?: string;
        }

        function initialize(options: {
          client_id: string;
          callback: (response: CredentialResponse) => void;
        }): void;

        function renderButton(
          parent: HTMLElement,
          options: {
            theme?: string;
            size?: string;
            text?: string;
            shape?: string;
          }
        ): void;
      }
    }
  }

  interface Window {
    google: typeof google;
  }
}
