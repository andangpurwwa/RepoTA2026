const API_URL = String(
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

const REQUEST_TIMEOUT_MS = Math.max(
  Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000,
  5000
);

const TOKEN_KEY = 'repota_token';
const USER_KEY = 'repota_user';

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function clearStoredSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function buildNetworkError(error) {
  if (error?.name === 'AbortError') {
    return new Error(
      'Permintaan terlalu lama. Periksa koneksi internet atau status backend lalu coba lagi.'
    );
  }

  if (error instanceof TypeError) {
    return new Error(
      `Gagal terhubung ke backend (${API_URL}). Pastikan backend berjalan dan konfigurasi CORS/CLIENT_URL sudah benar.`
    );
  }

  return error;
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const text = await response.text();

  if (!text) return null;

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  return text;
}

async function request(path, options = {}) {
  const {
    skipAuth = false,
    timeout = REQUEST_TIMEOUT_MS,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  const token = skipAuth ? null : getToken();
  const headers = new Headers(fetchOptions.headers || {});

  headers.set('Accept', 'application/json');

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  const abortFromExternalSignal = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', abortFromExternalSignal, {
        once: true,
      });
    }
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    throw buildNetworkError(error);
  } finally {
    window.clearTimeout(timeoutId);

    if (externalSignal) {
      externalSignal.removeEventListener('abort', abortFromExternalSignal);
    }
  }

  const payload = await parseResponse(response);

  if (response.status === 401 && !skipAuth) {
    clearStoredSession();

    window.dispatchEvent(
      new CustomEvent('repota:unauthorized', {
        detail: {
          message:
            payload?.message ||
            'Sesi login berakhir. Silakan masuk kembali.',
        },
      })
    );
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (typeof payload === 'string' ? payload : '') ||
      'Terjadi kesalahan koneksi ke server.';

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;

    throw error;
  }

  return payload;
}

function serializeBody(body) {
  if (body instanceof FormData) return body;
  return JSON.stringify(body ?? {});
}

export const api = {
  get: (path, options = {}) =>
    request(path, options),

  getPublic: (path, options = {}) =>
    request(path, {
      ...options,
      skipAuth: true,
    }),

  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'POST',
      body: serializeBody(body),
    }),

  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: serializeBody(body),
    }),

  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body: serializeBody(body),
    }),

  delete: (path, options = {}) =>
    request(path, {
      ...options,
      method: 'DELETE',
    }),

  fileUrl: (fileName) => {
    const token = getToken();
    const query = token
      ? `?token=${encodeURIComponent(token)}`
      : '';

    return `${API_URL}/repositories/download/${encodeURIComponent(
      fileName
    )}${query}`;
  },
};

export { API_URL, REQUEST_TIMEOUT_MS };
