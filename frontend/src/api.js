const API_URL = String(
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

function getToken() {
  return sessionStorage.getItem('repota_token');
}

function buildNetworkError(error) {
  if (error instanceof TypeError) {
    return new Error(
      `Gagal terhubung ke backend (${API_URL}). Pastikan backend berjalan dan konfigurasi CORS/CLIENT_URL sudah benar.`
    );
  }
  return error;
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json')
    ? response.json()
    : response.text();
}

async function request(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options;
  const token = skipAuth ? null : getToken();
  const headers = new Headers(fetchOptions.headers || {});

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch (error) {
    throw buildNetworkError(error);
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload?.message || payload || 'Terjadi kesalahan koneksi ke server.';
    throw new Error(message);
  }

  return payload;
}

function serializeBody(body) {
  if (body instanceof FormData) return body;
  return JSON.stringify(body || {});
}

export const api = {
  get: (path) => request(path),
  getPublic: (path) => request(path, { skipAuth: true }),
  post: (path, body) =>
    request(path, { method: 'POST', body: serializeBody(body) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: serializeBody(body) }),
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: serializeBody(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  fileUrl: (fileName) => {
    const token = getToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${API_URL}/repositories/download/${encodeURIComponent(fileName)}${query}`;
  },
};

export { API_URL };
