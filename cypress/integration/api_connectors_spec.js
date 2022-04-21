// load type definitions that come with Cypress module
/// <reference types="cypress" />
describe('Mobile Connectors', function () {
  let selectors = {
    fitbit: {
      username: '.pa0 > #loginForm > .row > #email-input > #ember644',
      password: '.pa0 > #loginForm > .row > #password-input > #ember645',
      submitButton: '.pa0 > #loginForm > .row > .column > #ember685',
    },
    rescuetime: {
      username: '#email',
      password: '#password',
      submitButton: 'button[name="button"]',
    },
    facebook: {
      username: '#email',
      password: '#pass',
      submitButton: '#u_0_2',
    },
    github: {
      username: '#login_field',
      password: '#password',
      submitButton: ['input[name="commit"]', 'button[name="authorize"]'],
    },
    runkeeper: {
      username: '#lightBoxLogInForm > input[id="emailInput"][name="email"]',
      password: '#lightBoxLogInForm > input[id="passwordInput"][name="password"]',
      submitButton: '#lightBoxLogInForm > button[id="loginSubmit"][type="submit"].component.ctaButton.primary.medium.signup_email_button.success.small.expand > .buttonText',
    },
  }
  function goToMobileConnectPage () {
    cy.visitApi(`/api/v1/connect/mobile?log=testuser&pwd=testing123`)
    //cy.checkForBrokenImages()  // Keeps falsely failing
  }
    /**
     * @param {string} connectorName
     */
    function clickConnect (connectorName) {
        cy.log(`Connecting ${connectorName}`)
        cy.get(`#${connectorName}-connect-button`).click()
        cy.wait(5000)
    }
    /**
     * @param {string} connectorName
     */
    function clickDisconnect (connectorName) {
        cy.log(`Disconnecting ${connectorName}`)
        cy.get(`#${connectorName}-disconnect-button`).click()
    }
    /**
     * @param {string} connectorName
     */
    function disconnectAndClickConnect (connectorName) {
        goToMobileConnectPage()
        // this only works if there's 100% guarantee body has fully rendered without any pending changes to its state
        cy.get(`#${connectorName} > div.qm-account-block-right > div.qm-button-container`,
            { timeout: 20000 }).then(($connectorBlock) => {
            debugger
            // synchronously ask for the body's text and do something based on whether it includes another string
            if ($connectorBlock.text().includes('Disconnect')) {
                clickDisconnect(connectorName)
                clickConnect(connectorName)
            } else {
                cy.log(`${connectorName} already disconnected`)
                clickConnect(connectorName)
            }
        })
    }
    /**
     * @param {string} connectorName
     */
    function enterCredentials (connectorName) {
        let user = Cypress.env(connectorName.toUpperCase() + '_TEST_USER')
        if(!user){
            throw "Please set env " + connectorName.toUpperCase() + '_TEST_USER'
        }
        cy.enterCredentials(selectors[connectorName].username,
            Cypress.env(connectorName.toUpperCase() + '_TEST_USER'),
            selectors[connectorName].password,
            Cypress.env(connectorName.toUpperCase() + '_TEST_PASSWORD'),
            selectors[connectorName].submitButton)
    }
    /**
     * @param {string} connectorName
     */
    function verifyConnection (connectorName) {
        cy.get(`#${connectorName}-scheduled-button`, { timeout: 60000 })
            .should('contain', 'Update Scheduled')
        cy.get(`#${connectorName}-disconnect-button`)
            .should('exist')
        cy.get(`#${connectorName}-connect-button`)
            .should('not.exist')
    }
    /**
     * @param {string} connectorName
     */
    function checkOAuthConnector (connectorName) {
        cy.log(`Cookies:${JSON.stringify(cy.getCookies())}`)
        disconnectAndClickConnect(connectorName)
        enterCredentials(connectorName)
        verifyConnection(connectorName)
        clickDisconnect(connectorName)
    }
  it.skip('Connects and disconnects Fitbit', function () {
    checkOAuthConnector('fitbit')
  })
    // TODO: Re-enable when Whatpulse is fixed
  it.skip('Connects and disconnects WhatPulse', function () {
    disconnectAndClickConnect('whatpulse')
    cy.get('input[name="username"]').type('mikepsinn', { force: true })
    cy.get('.qm-account-block[data-name=whatpulse3] .qm-account-connect-button-with-params')
            .click({ force: true })
    verifyConnection('whatpulse')
    clickDisconnect('whatpulse')
  })
  it.skip('Connects and disconnects MoodPanda', function () {
    disconnectAndClickConnect('moodpanda')
    cy.get('input[name="email"]').type('m@mikesinn.com', { force: true })
    cy.get('.qm-account-block[data-name=moodpanda10] .qm-account-connect-button-with-params')
            .click({ force: true })
    verifyConnection('moodpanda')
    clickDisconnect('moodpanda')
  })
  it.skip('Connects and disconnects GitHub', function () {
    let connectorName = 'github'

    checkOAuthConnector(connectorName)
  })
  it.skip('Connects and disconnects Facebook', function () {
    checkOAuthConnector('facebook')
  })
  it.skip('Connects and disconnects RunKeeper', function () {
    checkOAuthConnector('runkeeper')
  })
  it.skip('Connects and disconnects Rescuetime', function () {
    //cy.visit('https://www.rescuetime.com/logout');
    checkOAuthConnector('rescuetime')
  })
})
