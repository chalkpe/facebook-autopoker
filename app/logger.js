export default function log (...args) {
  return console.log(new Date().toISOString(), ...args)
}
