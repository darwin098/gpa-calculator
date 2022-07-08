var base = 'http://localhost:3000';

export function getAll() {
  var lastID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
  var isExpired = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var url = new URL('/storage/all', base);
  url.searchParams.append('lastID', lastID);
  url.searchParams.append('pageSize', pageSize);
  url.searchParams.append('isExpired', isExpired);
  return fetch(url).then(function (response) {
    return response.json();
  }).then(function (json) {
    if (json.error) {
      throw new Error(json.error);
    } else {
      return json;
    }
  });
}