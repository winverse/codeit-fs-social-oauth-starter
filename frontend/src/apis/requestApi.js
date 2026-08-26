const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001';

const isQueryValueDefined = (queryValue) =>
  queryValue !== undefined && queryValue !== null && queryValue !== '';

const toQueryString = (query = {}) =>
  new URLSearchParams(
    Object.entries(query)
      .filter(([, queryValue]) => isQueryValueDefined(queryValue))
      .map(([queryKey, queryValue]) => [queryKey, String(queryValue)]),
  ).toString();

const buildRequestUrl = (path, query = {}) => {
  const requestUrl = new URL(path, API_BASE_URL);
  requestUrl.search = toQueryString(query);
  return requestUrl.toString();
};

const toRequestError = (response, payload) => {
  const message = payload?.message ?? `HTTP ${response.status}`;
  const error = new Error(message);
  error.status = response.status;
  return error;
};

async function parseResponsePayload(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestApi(path, options = {}) {
  const {
    method = 'GET',
    body,
    query,
    headers,
    cache = 'no-store',
    next,
    credentials = 'same-origin',
  } = options;
  const requestBody = body ? JSON.stringify(body) : undefined;

  const response = await fetch(buildRequestUrl(path, query), {
    method,
    cache,
    credentials,
    headers: {
      Accept: 'application/json',
      ...(requestBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(requestBody ? { body: requestBody } : {}),
    ...(next ? { next } : {}),
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    throw toRequestError(response, payload);
  }

  return payload;
}
