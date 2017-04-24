export default function watch ($) {
  const pattern = /poked you ([\d,]+) times? in a row/i

  const cut = text => text.slice(text.lastIndexOf('=') + 1)
  const number = text => parseInt(text.replace(/\D/g, ''), 10)

  const k = 'data-already-poked'
  const alreadyPoked = (a, v) => v ? a.setAttribute(k, v) : a.getAttribute(k)
  const hovercard = a => a && a.getAttribute('data-hovercard')

  const [isUser, getUser] = [
    (a, attr = hovercard(a)) => attr && attr.includes('/hovercard/user.php'),
    (a, attr = hovercard(a)) => attr && { name: a.innerHTML, id: cut(attr) }
  ]

  const [isTimes, getTimes] = [
    div => pattern.test(div.innerHTML),
    div => number(pattern.exec(div.innerHTML)[1])
  ]

  const isPoke = a => a && a.getAttribute && a.innerHTML &&
    alreadyPoked(a) !== 'yes' && a.innerHTML.toLowerCase().includes('poke back')

  function pokeBack (a) {
    a.click()
    alreadyPoked(a, 'yes')

    const block = a.parentElement.parentElement.parentElement
    const user = getUser($(block, 'a').filter(a => isUser(a)).pop())
    const times = getTimes($(block, 'div').filter(a => isTimes(a)).pop())

    return `${user.name} x${times || 0} (${user.id})`
  }

  return $(document, 'a').filter(isPoke).map(pokeBack)
}
