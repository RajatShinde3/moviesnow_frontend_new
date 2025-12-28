from pathlib import Path

# Add apiClient export to client.ts
client_ts = Path("src/lib/api/client.ts")
content = client_ts.read_text(encoding='utf-8')

# Check if apiClient already exists
if 'export const apiClient' not in content:
    api_client_code = '''
/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                     API Client Wrapper (Legacy Support)                 ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Legacy API client wrapper that provides axios-like interface
 * Returns data wrapped in { data: T } format for backward compatibility
 */
export const apiClient = {
  async get<T = any>(url: string, config?: Omit<FetchJsonOptions, 'method'>): Promise<{ data: T }> {
    const data = await fetchJson<T>(url, { ...config, method: 'GET' });
    return { data: data as T };
  },

  async post<T = any>(url: string, data?: any, config?: Omit<FetchJsonOptions, 'method' | 'json'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'POST', json: data });
    return { data: result as T };
  },

  async put<T = any>(url: string, data?: any, config?: Omit<FetchJsonOptions, 'method' | 'json'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'PUT', json: data });
    return { data: result as T };
  },

  async patch<T = any>(url: string, data?: any, config?: Omit<FetchJsonOptions, 'method' | 'json'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'PATCH', json: data });
    return { data: result as T };
  },

  async delete<T = any>(url: string, config?: Omit<FetchJsonOptions, 'method'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'DELETE' });
    return { data: result as T };
  },
};
'''

    content = content + api_client_code
    client_ts.write_text(content, encoding='utf-8')
    print("Added apiClient to client.ts")
else:
    print("apiClient already exists in client.ts")
