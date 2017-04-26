export default (query, element) =>
  [].slice.call((element || document).querySelectorAll(query))
