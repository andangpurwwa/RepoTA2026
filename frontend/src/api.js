const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return sessionStorage.getItem('repota_token');
}

function buildNetworkError(error) {
  if (error instanceof TypeError) {
    return new Error(
      'Gagal terhubung ke backend. Pastikan backend berjalan di http://localhost:5000 dan CORS/CLIENT_URL sudah benar.'
    );
  }
  return error;
}

async function request(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options;
  const token = skipAuth ? null : getToken();
  const headers = new Headers(fetchOptions.headers || {});

  if (!(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  } catch (error) {
    throw buildNetworkError(error);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload || 'Terjadi kesalahan koneksi ke server.';
    throw new Error(message);
  }

  return payload;
}

export const api = {
  get: (path) => request(path),
  getPublic: (path) => request(path, { skipAuth: true }),
  post: (path, body) => request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body || {}) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  fileUrl: (fileName) => {
    const token = getToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${API_URL}/repositories/download/${encodeURIComponent(fileName)}${query}`;
  },
};

export { API_URL };
