export default function authenticate ($, system) {
  let emailInput = document.getElementById('email')
  if (emailInput) emailInput.value = system.args[1]

  let passwordInput = document.getElementById('pass')
  if (passwordInput) passwordInput.value = system.args[2]

  let loginButton = document.getElementById('loginbutton')
  if (loginButton) loginButton.click()

  let continueButton = document.getElementById('checkpointSubmitButton')
  if (continueButton) {
    $(document, 'span').forEach(span => {
      let text = span.innerHTML.toLowerCase()
      if (text.includes('approve')) span.click()
    })
    continueButton.click()
  }

  return !loginButton && !continueButton && !emailInput &&
    document.title && !document.title.includes('Log into') &&
    document.URL && !document.URL.includes('facebook.com/checkpoint/')
}
