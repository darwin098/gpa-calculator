const base = `http://localhost:3000`;

export function getAll(lastID = 0, pageSize = 20, isExpired = 1) {
  const url = new URL(`/storage/all`, base);
  url.searchParams.append('lastID', lastID);
  url.searchParams.append('pageSize', pageSize);
  url.searchParams.append('isExpired', isExpired);
  return fetch(url)
    .then((response) => response.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.error);
      } else {
        return json;
      }
    });
}

export function expireKey(key, expiryDate) {
  const url = new URL(`/storage/all`, base);
  url.searchParams.append('key', key);
  url.searchParams.append('expiryDate', expiryDate);

  return fetch(url, { method: 'PUT' })
    .then((response) => {
      if (response.ok) {
        return {};
      } else {
        return response.json();
      }
    })
    .then((json) => {
      if (json.error) {
        throw new Error(json.error);
      } else {
        return json;
      }
    });
}
