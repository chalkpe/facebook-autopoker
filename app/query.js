export default (element, tagName) => {
  const nodes = element.getElementsByTagName(tagName)
  return Array.prototype.slice.call(nodes)
}
