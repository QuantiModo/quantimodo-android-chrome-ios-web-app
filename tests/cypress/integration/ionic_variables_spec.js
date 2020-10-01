// load type definitions that come with Cypress module
/// <reference types="cypress" />
let variableName = 'Aaa Test Treatment'
let settingsPath = `/#/app/variable-settings/${encodeURIComponent(variableName)}`
let chartsPath = `/#/app/charts/${encodeURIComponent(variableName)}`
/**
 * @param {string} variableString
 */
function verifyAndDeleteMeasurement(variableString){
    cy.get('#historyItemTitle').should('contain', variableString)
    cy.get('#historyItemTitle').click({force: true})
    cy.get('button.button.destructive').click({force: true})
    cy.log('Waiting for deletion to complete...')
    cy.wait(5000) // Don't remove this
}
/**
 * @param {string} variableName
 * @param timeout
 */
function searchForMoodFromMagnifyingGlassIcon(variableName, timeout = 1000){
    //cy.wait(1000)
    cy.get('#menu-search-button').click({force: true})
    cy.get('md-autocomplete-wrap.md-whiteframe-z1 > input[type="search"]').click({force: true})
    cy.get('md-autocomplete-wrap.md-whiteframe-z1 > input[type="search"]').type(variableName, {force: true})
    cy.log('Wait for filtering')
    cy.wait(timeout)
    cy.get('#variable-item-title > span', {timeout: 60000})
        .contains(variableName)
        .click({force: true})
}
/**
 * @param {number} value
 */
function recordRatingMeasurement(value){
    cy.get(`.primary-outcome-variable-history > img:nth-of-type(${value})`).click({force: true})
    cy.get('#saveButton').click({force: true})
}
describe('Variables', function(){
    it('Creates a new emotion variable by measurement', function(){
        let variableCategoryName = 'Emotions';
        cy.loginWithAccessTokenIfNecessary(`/#/app/measurement-add-search?variableCategoryName=${variableCategoryName}`, true)
        let d = new Date()
        let variableString = `Unique Test Variable ${d.getTime()}`
        cy.get('#variableSearchBox').type(variableString, {force: true})
        cy.get('#new-variable-button', {timeout: 30000}).click({force: true})
        cy.get('.primary-outcome-variable-history > img:nth-of-type(3)').click({force: true})
        cy.get('#saveButton').click({force: true})
        cy.visitIonicAndSetApiUrl(`/#/app/history-all?variableCategoryName=${variableCategoryName}`)
        verifyAndDeleteMeasurement(variableString)
    })
    // Randomly started failing
    it('Goes to charts page from the variable action sheet', function(){
        cy.loginWithAccessTokenIfNecessary('/#/app/reminders-inbox', true)
        let variableName = 'Overall Mood'
        searchForMoodFromMagnifyingGlassIcon(variableName, 15000)
        cy.clickActionSheetButtonContaining('Charts')
        cy.url().should('contain', 'charts')
        cy.log('Chart is present and titled')
        cy.contains(`${variableName} Over Time`, {timeout: 30000})
    })
    it('Creates reminder from the variable action sheet', function(){
        cy.loginWithAccessTokenIfNecessary('/#/app/reminders-inbox', true)
        let variableName = 'Overall Mood'
        searchForMoodFromMagnifyingGlassIcon(variableName)
        cy.clickActionSheetButtonContaining('Add Reminder')
        cy.toastContains(variableName)
    })
    it('Creates study from the variable action sheet', function(){
        cy.loginWithAccessTokenIfNecessary('/#/app/reminders-inbox', true)
        let variableName = 'Overall Mood'
        searchForMoodFromMagnifyingGlassIcon(variableName)
        cy.clickActionSheetButtonContaining('Create Study')
        cy.get('#effectVariableName').should('contain', variableName)
        searchForMoodFromMagnifyingGlassIcon(variableName)
    })
    it('Records measurement from the variable action sheet', function(){
        cy.loginWithAccessTokenIfNecessary('/#/app/reminders-inbox', true)
        let variableName = 'Overall Mood'
        searchForMoodFromMagnifyingGlassIcon(variableName, 15000)
        cy.clickActionSheetButtonContaining('Record Measurement')
        recordRatingMeasurement(3)
    })
    it('Goes to predictors page from the variable action sheet', function(){
        cy.loginWithAccessTokenIfNecessary('/#/app/reminders-inbox', true)
        let variableName = 'Overall Mood'
        searchForMoodFromMagnifyingGlassIcon(variableName, 10000)
        cy.clickActionSheetButtonContaining('Predictors')
        cy.get('.item.item-avatar > p', {timeout: 90000}).should('contain', variableName)
    })
    it('Changes and resets variable settings', function(){
        let max = '10000'
        let min = '1'
        let delay = '2'
        let duration = '5'
        let filling = '0'
        cy.loginWithAccessTokenIfNecessary(settingsPath)
        cy.get('#resetButton', {timeout: 30000}).click({force: true})
        cy.assertInputValueEquals('#minimumAllowedValue', '0')
        cy.clearAndType('#minimumAllowedValue', min)
        cy.clearAndType('#maximumAllowedValue', max)
        cy.clearAndType('#onsetDelay', delay)
        cy.clearAndType('#durationOfAction', duration)
        cy.clearAndType('#fillingValue', filling)
        cy.get('#saveButton').click({force: true})
        cy.get('#helpInfoCardHeader > span:nth-child(2) > p', {timeout: 30000})
        cy.url().should('not.contain', 'variable-settings')
        cy.visitIonicAndSetApiUrl(settingsPath)
        cy.wait(15000)
        cy.log("TODO: TEST TO MAKE SURE THE CHANGES STUCK. IT'S CURRENTLY VERY FLAKEY")
        cy.log("minimumAllowedValue should be "+min)
        cy.assertInputValueContains('#minimumAllowedValue', min);
        cy.log("maximumAllowedValue should be "+max)
        cy.assertInputValueEquals('#maximumAllowedValue', max);
        cy.log("onsetDelay should be "+delay)
        cy.assertInputValueEquals('#onsetDelay', delay)
        cy.log("durationOfAction should be "+duration)
        cy.assertInputValueEquals('#durationOfAction', duration)
        cy.log("fillingValue should be "+filling)
        cy.assertInputValueEquals('#fillingValue', filling)
        cy.get('#resetButton').click({force: true, timeout: 30000})
        cy.wait(15000)
        //cy.url().should('not.contain', 'variable-settings');
        //cy.visit(settingsPath);
        cy.log("minimumAllowedValue should be 0")
        cy.assertInputValueEquals('#minimumAllowedValue', '0')
        cy.log("maximumAllowedValue should be "+max)
        cy.assertInputValueDoesNotContain('#maximumAllowedValue', max)
        cy.log("onsetDelay should be 0.5")
        cy.assertInputValueEquals('#onsetDelay', '0.5')
        cy.log("durationOfAction should be 504")
        cy.assertInputValueEquals('#durationOfAction', '504')
    })
    it('Goes to variable settings from chart page', function(){
        cy.loginWithAccessTokenIfNecessary('/#/app/chart-search')
        cy.searchAndClickTopResult(variableName, true)
        cy.url().should('contain', chartsPath)
        cy.contains(variableName+" Over Time", {timeout: 30000}).then(() => { // Need to wait for variable for action sheet to work
            cy.get('#menu-more-button').click({ force: true })
            cy.clickActionSheetButtonContaining("Settings")
            cy.wait(2000)
            cy.url().should('contain', settingsPath)
        })
    })
    // Randomly failing
    it('Creates a new symptom rating variable by measurement', function(){
        cy.loginWithAccessTokenIfNecessary(`/#/app/measurement-add-search`, true)
        let d = new Date()
        let variableString = `Unique Test Variable ${d.getTime()}`;
        let variableCategoryName = 'Symptoms'
        cy.get('#variableSearchBox').type(variableString, {force: true})
        cy.get('#new-variable-button', {timeout: 30000}).click({force: true})
        cy.get('.scroll > #measurementAddCard > .list > .item > #variableCategorySelector').select(variableCategoryName)
        cy.get('.primary-outcome-variable-history > img:nth-of-type(3)').click({force: true})
        cy.get('#saveButton').click({force: true})
        cy.visitIonicAndSetApiUrl(`/#/app/history-all?variableCategoryName=${variableCategoryName}`)
        verifyAndDeleteMeasurement(variableString)
    })
})
