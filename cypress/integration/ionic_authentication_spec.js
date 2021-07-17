/* eslint-disable cypress/no-unnecessary-waiting,cypress/no-assigning-return-values */
// load type definitions that come with Cypress module
let selectors = {
  usernameInput: '#username-group > input',
  emailInput: '#email-group > input',
  pw: '#password-group > input',
  pwConfirm: '#password-confirm-group > input',
  registerButton: '#submit-button-group > div > input.btn.btn-primary',
  acceptButton: '#button-approve',
  errorMessageSelector: '#error-messages > li',
}
/// <reference types="cypress" />
describe('Authentication', function () {
  let clientId = 'oauth_test_client'
  let clientSecret = 'oauth_test_client_secret'
  let appDisplayName = 'OAuth test client'
  let testUserName = 'testuser'
  let testUserPassword = 'testing123'
  let API_HOST = cy.getApiHost()
  // noinspection SpellCheckingInspection
    let authorizePath = `/api/oauth2/authorize?` +
        'response_type=code&' +
        'scope=readmeasurements%20writemeasurements&' +
        'state=testabcd&'
  function goToIntroPage (clientId) {
    let url = `/#/app/intro?clientId=${clientId}&logout=true`
    cy.visitIonicAndSetApiUrl(url)
    cy.url().should('contain', 'intro')
  }
  function checkOauthPageAndAccept (appDisplayName) {
    cy.get('.dialog-content').should('contain', appDisplayName)
    cy.get('#button-deny').should('contain', 'Cancel')
    cy.get('#button-approve').should('contain', 'Accept')
    cy.get('#button-approve').click({ force: true })
  }
  it.skip('Logs into and out of an OAuth test client app', function () {
    let clientId = 'oauth_test_client'
    let appDisplayName = 'OAuth test client'
    goToIntroPage(clientId)
    cy.disableSpeechAndSkipIntro()
    cy.get('#circle-page-title').should('contain', appDisplayName)
    cy.get('#skipButtonIntro').click({ force: true })
    cy.get('#signInButton').click({ force: true })
    cy.enterCredentials()
    checkOauthPageAndAccept(appDisplayName)
    //cy.get('#skipButtonWelcome').click({ force: true });
    cy.url().should('include', '/login')
    cy.wait(10000)
    cy.log('We should be at onboarding now')
    cy.url().should('include', '/onboarding')
    //cy.get('#circle-page-title', {timeout: 90000}).should('contain', "Emotions");  // I have no idea why this won't work
    cy.log('Menu hidden on onboarding page so going straight to settings url')
    cy.logOutViaSettingsPage(false)
  })
  it('Tries to create account with existing username', function () {
    cy.clearCookies()
    cy.visitApi(`/api/v2/auth/register`)
    cy.get(selectors.usernameInput).type('mike')
    cy.get(selectors.emailInput).type('m@thinkbynumbers.org')
    cy.get(selectors.pw).type(testUserName)
    cy.get(selectors.pwConfirm).type(testUserPassword)
    cy.get(selectors.registerButton).click({ force: true })
    cy.contains('#error-messages', 'The user login has already been taken.')
      //cy.contains('#error-messages', 'The email has already been taken.')
      //cy.contains('#error-messages', 'must match')
  })
  it('Logs in and redirects to authorization page', function () {
    let redirectUrl = `https://${API_HOST}${authorizePath}client_id=${clientId}&client_secret=${clientSecret}`
    cy.visitApi(`/api/v2/auth/login?redirectTo=${encodeURIComponent(redirectUrl)}`)
    cy.enterCredentials()
    cy.allowUncaughtException('Unexpected token')
    checkOauthPageAndAccept(appDisplayName)
    cy.allowUncaughtException(null)
  })
  it.skip('Logs in and out with username and password', function () {
    cy.goToApiLoginPageAndLogin(testUserName, testUserPassword)
    cy.disableSpeechAndSkipIntro()
    cy.log('testuser already has reminders so skipping onboarding ang going to inbox')
    cy.wait(2000)
    cy.url().should('contain', 'inbox')
    cy.logOutViaSettingsPage(true) // Going directly via cy.visit breaks for some reason
    cy.disableSpeechAndSkipIntro()
    cy.url().should('contain', 'login')
  })
  it.skip('Registers a new user with username and password starting from OAuth web app', function () {
    let appDisplayName = 'OAuth test client'
    let baseUrl = Cypress.config('baseUrl')
    cy.log(`baseUrl is ${baseUrl}`)
    goToIntroPage(clientId)
    cy.disableSpeechAndSkipIntro()
    cy.get('#signUpButton').click({ force: true })
    cy.enterNewUserCredentials(false)
    checkOauthPageAndAccept(appDisplayName)
    cy.wait(2000)
    cy.url().should('contain', 'onboarding')
    cy.logOutViaSettingsPage(false)
    cy.disableSpeechAndSkipIntro()
    cy.get('#signUpButton').should('exist')
  })
  it('Registers a new user after redirecting from authorization page)', function () {
    cy.visitApi(`${authorizePath}client_id=${clientId}&client_secret=${clientSecret}&register=true`)
    cy.enterNewUserCredentials(false)
    cy.get('.dialog-content').should('contain', appDisplayName)
    //checkOauthPageAndAccept(appDisplayName);
    //cy.allowUncaughtException(); // For some reason callback page has errors
    //cy.wait(5000);
    // TODO: Uncomment after 404.html is deployed to production
    //cy.url().should('contain', "ionic/Modo/www/callback/?code=");
  })
  it('Logs in after redirecting from authorization page', function () {
    cy.visitApi(`${authorizePath}client_id=${clientId}&client_secret=${clientSecret}&register=false`)
    cy.enterCredentials()
    cy.get('.dialog-content').should('contain', appDisplayName)
    //checkOauthPageAndAccept(appDisplayName);
  })
  it.skip('Logs in via Facebook', function () {
    // TODO: Fix me because I just lead so a broken cypress page and can't even see other test results
    cy.visitApi(`/api/v2/auth/login`)
    cy.get('body > div.container > div > div.panel-body.social > div:nth-child(1) > a')
            .click({ force: true })
    cy.get('#email').click({ force: true })
    cy.get('#email').type('frfdorf_putnamescu_1454115735@tfbnw.net', { force: true })
    cy.get('#pass').click({ force: true })
    cy.get('#pass').type(Cypress.env('FACEBOOK_TEST_PASSWORD'), { force: true })
    // noinspection SpellCheckingInspection
      cy.get('#loginbutton').click({ force: true })
    cy.get('#skipButtonIntro').click({ force: true })
    cy.log('Wont be there if user has not upgraded')
    cy.get('#navBarAvatar').click({ force: true })
  })
  it('Has error message if wrong email on password reset attempt', function () {
    cy.visitApi(`/api/v2/password/reset`)
    cy.get('.card-body > form > .form-group > .col-md-6 > #email')
            .type('ivsadfy@thinkbynumbers.org')
    cy.get('.container > .row > .col-md-8 > .card > .card-body').click()
    cy.get('.card-body > form > .form-group > .col-md-6 > .btn').click()
    cy.url().should('contain', 'api/v2/password/reset')
    cy.get('.col-md-8 > .card > .card-body > form > .form-group:nth-child(2)').click()
    // TODO: uncomment after fixing
    // cy.get('.card > .card-body > form > .form-group:nth-child(2) > .col-md-6')
    //     .contains("We can't find a user with that e-mail address.")
  })
})
