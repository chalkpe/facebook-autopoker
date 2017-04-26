export default function watch ($) {
  const pattern = /poked you ([\d,]+) times? in a row/i
  const [key, attr, mark] = ['parentElement', 'data-hovercard', 'data-poked']

  function cut (a) {
    const text = a.getAttribute && a.getAttribute(attr)
    return text && text.slice(text.lastIndexOf('=') + 1)
  }

  const selectors = [
    'div#contentArea',
    'div._4-u2._xct._4-u8:first-child',
    'a._42ft._4jy0._4jy3._4jy1.selected._51sy'
  ]

  return $(`${selectors.join(' ')}:not([${mark}])`).map(a => {
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
