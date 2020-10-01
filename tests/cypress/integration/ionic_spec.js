// load type definitions that come with Cypress module
/// <reference types="cypress" />
describe('Floating Action Button', function () {
  it('Tries out all four buttons from inbox', function () {
    let selectors = {
      'redMaterialButtonExpanded': '#floatingActionButton > li > ul',
      'redMaterialButtonPlus': '#floatingActionButton > li > a > i.mfb-component__main-icon--resting.ion-plus-round',
      'redMaterialButtonMinus': '#floatingActionButton > li > a > i.mfb-component__main-icon--active.ion-minus-round',
    }

    cy.loginWithAccessTokenIfNecessary('/#/app/reminders-inbox')
    cy.log('Circle + (record) on bottom left is present')
    cy.get(selectors.redMaterialButtonPlus).should('exist')
    cy.log('Click + button')
    cy.get(selectors.redMaterialButtonPlus).click({ force: true })
    cy.log(
      'There are four buttons above the + (record a symptom, import data, record a measurement, add a reminder)')
    cy.log('Click Add a Favorite Variable')
    cy.get('#mfb4').click({ force: true })
    cy.log('Check that favorite search loaded')
    cy.url().should('include', '#/app/help')
    cy.visitIonicAndSetApiUrl('/#/app/reminders-inbox')
    cy.log('Click Record a Measurement')
    cy.get('#mfb2').click({ force: true })
    cy.log('Check that track factors (record measurement) loaded')
    cy.url().should('include', '#/app/measurement-add-search')
    cy.visitIonicAndSetApiUrl('/#/app/reminders-inbox')
    cy.log('Click Add a Reminder')
    cy.get('#mfb1').click({ force: true })
    cy.log('Check that reminder search page loaded')
    cy.url().should('include', '#/app/reminder-search')
    cy.log('Load reminders inbox')
    cy.visitIonicAndSetApiUrl('/#/app/reminders-inbox')
    cy.get('#floatingActionButton').click({ force: true })
    cy.log('Click the - button to hide menu')
    cy.get(selectors.redMaterialButtonMinus).click({ force: true, multiple: true })
      cy.logOutViaSettingsPage(false)
  })
})
