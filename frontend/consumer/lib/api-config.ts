/**
 * Global API configuration for VinoSphere.
 * Automatically points to process.env.NEXT_PUBLIC_API_URL when deployed,
 * or defaults to local development backend.
 */
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_HOST = rawUrl.replace(/\/+$/, '');
export const API_V1_URL = API_HOST.endsWith('/api/v1') ? API_HOST : `${API_HOST}/api/v1`;
