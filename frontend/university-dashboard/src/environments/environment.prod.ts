declare const window: any;

export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && window.config?.apiUrl) || 'http://api:8000'
};