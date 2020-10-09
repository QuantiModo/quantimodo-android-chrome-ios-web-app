// load type definitions that come with Cypress module
/// <reference types="cypress" />
/**
 * @param {string} variableName
 */
function goToChartPage (variableName) {
  cy.loginWithAccessTokenIfNecessary('/#/app/chart-search', true)
  cy.wait(2000)
  cy.searchAndClickTopResult(variableName, true)
  cy.wait(2000)
  checkChartsPage(variableName)
}
/**
 * @param {string} variableName
 */
function checkChartsPage (variableName) {
  cy.url().should('contain', 'charts')
  cy.log('Chart is present and titled')
  cy.get('#app-container > ion-side-menu-content > ion-nav-view > ion-view > ion-content > div.scroll > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > h2',
    { timeout: 30000 })
        .should('contain', `${variableName} Over Time`)
  cy.get('.scroll > div:nth-of-type(2) > div:nth-of-type(2) > .card:nth-of-type(2) > .item.item-text-wrap > h2',
    { timeout: 60000 })
        .should('contain', variableName)
}
describe('Charts', function () {
  it('Looks at primary outcome charts', function () {
    cy.loginWithAccessTokenIfNecessary('/#/app/track', true)
    cy.loginWithAccessTokenIfNecessary('/#/app/track', true) // Avoid leftover redirects
    cy.get('div.primary-outcome-variable-rating-buttons > img:nth-child(4)').click({ force: true })
    cy.get('g.highcharts-series > rect:nth-of-type(1)').should('exist')
    cy.get('#distributionChart > div > svg > text.highcharts-title > tspan')
            .should('contain', 'Mood Distribution')
    cy.log('Use the scroll bar to see the charts below')
    cy.get('div.scroll-bar.scroll-bar-v > div')
    cy.get('#lineChart > div > svg > text > tspan').should('contain', 'Mood Over Time')
    cy.get('#distributionChart > div > svg > g:nth-child(9)').should('exist')
  })
  it.skip('Goes to variable settings from charts page', function () {
    goToChartPage('Aaa Test Treatment')
    cy.get('ion-view.pane > ion-content.scroll-content.ionic-scroll.has-header').click({ force: true })
    cy.get('#menu-more-button').click({ force: true })
    cy.clickActionSheetButtonContaining('Settings')
  })
  it.skip('Records a measurement and sees it in a chart', function () {
    //cy.loginWithAccessTokenIfNecessary(`/#/app/measurement-add-search?variableCategoryName=Treatments`, true);
    //recordTreatmentMeasurement();
    let variableName = 'Aaa Test Treatment'

    goToChartPage(variableName)
    cy.get('#recordMeasurementButton').click({ force: true })
    cy.get('#measurementAddCard > div').should('contain', variableName)
    cy.get('#cancelButton').click({ force: true })
  })
})
