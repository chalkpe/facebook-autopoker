export default function authenticate ($, system) {
  let emailInput = $('#email')[0]
  if (emailInput) emailInput.value = system.args[1]

  let passwordInput = $('#pass')[0]
  if (passwordInput) passwordInput.value = system.args[2]

  let loginButton = $('#loginbutton')[0]
  if (loginButton) loginButton.click()

  let continueButton = $('checkpointSubmitButton')[0]
  if (continueButton) {
    $('span').forEach(span => {
      let text = span.innerHTML.toLowerCase()
      if (text.includes('approve')) span.click()
    })
    continueButton.click()
  }

  return !loginButton && !continueButton && !emailInput &&
    document.title && !document.title.includes('Log into') &&
    document.URL && !document.URL.includes('facebook.com/checkpoint/')
}
