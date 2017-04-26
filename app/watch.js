export default function watch ($) {
  const pattern = /poked you ([\d,]+) times? in a row/i
  const [key, attr, mark] = ['parentElement', 'data-hovercard', 'data-poked']

  function cut (a) {
    const text = a.getAttribute && a.getAttribute(attr)
    return text && text.slice(text.lastIndexOf('=') + 1)
  }

  return $(`a._42ft._4jy0._4jy3._4jy1.selected._51sy:not([${mark}])`).map(a => {
    a.click()
    a.setAttribute(mark, 'yes')

    const $parent = a[key][key][key]
    const $a = $(`a[${attr}]`, $parent).pop()
    const $div = $('div', $parent).find(div => pattern.test(div.innerHTML))

    const [name, id] = [$a && $a.innerHTML, $a && cut($a)]
    const times = $div && pattern.exec($div.innerHTML)[1].replace(/\D/g, '')

    return `${name} x${times || 0} (${id})`
  })
}
