// Global type declarations for third-party scripts

type AdsByGoogle = Array<Record<string, string | number | boolean>>;

type GtagCommand = 'event' | 'config' | 'js' | 'set';

interface GtagEventParams {
  value?: number;
  event_label?: string;
  non_interaction?: boolean;
  page_path?: string;
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    adsbygoogle: AdsByGoogle;
    dataLayer: Array<Record<string, string | number | boolean | Date>>;
    gtag: (command: GtagCommand, target: string | Date, params?: GtagEventParams) => void;
  }
}

export {};
