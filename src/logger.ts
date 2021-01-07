export function log(key, value) {
  if (window.localStorage.getItem("print")) {
    console.log(key, value);
  }
}
