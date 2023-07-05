import fetch, { RequestInit } from 'node-fetch';

export function api<T>(url: string, info: RequestInit): Promise<T> {
  return fetch(url, info)
    .then((response: Response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<T>;
    })
    .catch((error: Error) => {
      throw error;
    });
}
