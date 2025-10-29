declare const window: any;

export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && window.config?.apiUrl) || 'http://localhost:8000'
};