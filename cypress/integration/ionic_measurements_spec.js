// load type definitions that come with Cypress module
/// <reference types="cypress" />
/**
 * @param {number} initialMoodValue
 */
function recordMeasurementAndCheckHistoryPage (initialMoodValue) {
  cy.url().should('contain', '/measurement-add')
  cy.get(`.primary-outcome-variable-history > img:nth-of-type(${initialMoodValue})`)
        .click({ force: true })
  cy.get('#saveButton').click({ force: true })
  cy.log('Waiting for measurement to post to API...')
  cy.wait(10000)
  cy.visitIonicAndSetApiUrl('/#/app/history-all-variable/Overall Mood')

    function moodValueToImage(value) {
        return ratingImages.positive[value - 1];
    }

    let desiredImageName = moodValueToImage(initialMoodValue)
  cy.get("#historyItem-0 > img", {timeout: 30000})
      .invoke('attr', 'src')
      .should('contain', desiredImageName);
}
const ratingImages = {
    positive: [
        'img/rating/face_rating_button_256_depressed.png',
        'img/rating/face_rating_button_256_sad.png',
        'img/rating/face_rating_button_256_ok.png',
        'img/rating/face_rating_button_256_happy.png',
        'img/rating/face_rating_button_256_ecstatic.png',
    ],
        negative: [
        'img/rating/face_rating_button_256_ecstatic.png',
        'img/rating/face_rating_button_256_happy.png',
        'img/rating/face_rating_button_256_ok.png',
        'img/rating/face_rating_button_256_sad.png',
        'img/rating/face_rating_button_256_depressed.png',
    ],
        numeric: [
        'img/rating/numeric_rating_button_256_1.png',
        'img/rating/numeric_rating_button_256_2.png',
        'img/rating/numeric_rating_button_256_3.png',
        'img/rating/numeric_rating_button_256_4.png',
        'img/rating/numeric_rating_button_256_5.png',
    ],
}
/**
 * @param {number} [dosageValue]
 */
function recordTreatmentMeasurementAndCheckHistoryPage (dosageValue) {
  if (!dosageValue) {
    let d = new Date()
    dosageValue = d.getMinutes()
  }
  cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add-search?variableCategoryName=Treatments')
  let variableName = 'Aaa Test Treatment'

  cy.searchAndClickTopResult(variableName, true)
  cy.log('Click Remind me to track')
  cy.get('#reminderButton').click({ force: true })
  cy.log('Check that reminders add page was reached')
  cy.url().should('include', '#/app/reminder-add')
  cy.get('#cancelButton').click({ force: true })
  cy.log('Get dosage value from current time (minutes)')
  cy.log('Assign current minutes to dosage')
  cy.get('#defaultValue').type(dosageValue.toString(), { force: true })
  cy.get('#unitSelector').should('contain', 'Milligrams')
  cy.log('Check that mg is selected')
  cy.get('#saveButton').click({ force: true })
  cy.wait(10000)
  cy.visitIonicAndSetApiUrl('/#/app/history-all-category/Treatments')
  let treatmentStringNoQuotes = `${dosageValue} mg Aaa Test Treatment`

  cy.get('#historyItemTitle', { timeout: 40000 })
        .should('contain', treatmentStringNoQuotes)
}
/**
 * @param {string} itemTitle
 */
function editHistoryPageMeasurement (itemTitle) {
  cy.log(`Editing history measurement with title containing: ${itemTitle}`)
  cy.get('#historyItemTitle', { timeout: 30000 }).contains(itemTitle)
  cy.get('#action-sheet-button', { timeout: 30000 }).click({ force: true })
  cy.clickActionSheetButtonContaining('Edit')
  cy.wait(2000)
  cy.url().should('include', 'measurement-add')
}
describe('Measurements', function () {
    // Skipping because it fails randomly and can't reproduce failure locally
  it('Goes to edit measurement from history page', function () {
    cy.loginWithAccessTokenIfNecessary('/#/app/history-all-category/Anything')
    cy.get('#historyItemTitle', { timeout: 30000 }).click({force: true})
    cy.clickActionSheetButtonContaining('Edit')
    cy.wait(2000)
    cy.url().should('include', 'measurement-add')
  })
    // Skipping because it fails randomly and can't reproduce failure locally
  it.skip('Records, edits, and deletes a mood measurement', function () {
    cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add-search')
    let variableName = 'Overall Mood'
    cy.searchAndClickTopResult(variableName, true)
    let d = new Date()
    let seconds = d.getSeconds()
    let initialMoodValue = (seconds % 5) + 1
    recordMeasurementAndCheckHistoryPage(initialMoodValue)
    cy.get('#hidden-measurement-id-0').then(($el) => {
        let measurementId = $el.text();
        cy.get('#action-sheet-button-0').click({force: true});
        cy.clickActionSheetButtonContaining('Edit');
        let newMoodValue = ((initialMoodValue % 5) + 1);
        //cy.visit(`/#/app/measurement-add?measurementId=${measurementId}`);
        recordMeasurementAndCheckHistoryPage(newMoodValue);
        cy.get("#hidden-measurement-id-0").then(($el) => {
            let editedMeasurementId = $el.text();
            cy.visitIonicAndSetApiUrl(`/#/app/measurement-add?measurementId=${editedMeasurementId}`);
            cy.get('#deleteButton').click({force: true}); cy.wait(10000);
            cy.visitIonicAndSetApiUrl(`/#/app/history-all-variable/Overall Mood`);
            cy.get("#hidden-measurement-id-0").should('not.contain', editedMeasurementId);
        });
    });
  })
    // Skipping because it fails randomly and can't reproduce failure locally
  it.skip('Record, edit, and delete a treatment measurement', function () {
    let dosageValue = 100

    recordTreatmentMeasurementAndCheckHistoryPage(dosageValue)
    editHistoryPageMeasurement(dosageValue.toString())
    let newDosageValue = dosageValue / 10

    cy.get('#defaultValue').type(newDosageValue.toString(), { force: true })
    cy.get('#saveButton').click({ force: true })
    cy.wait(10000)
    cy.visitIonicAndSetApiUrl('/#/app/history-all-category/Treatments')
    let treatmentStringEditedNoQuotes = `${newDosageValue} mg Aaa Test Treatment`

    editHistoryPageMeasurement(newDosageValue.toString())
    cy.get('button.button.icon-left.ion-trash-a').click({ force: true })
    cy.wait(10000)
    cy.url().should('include', '/#/app/history-all-category/Treatments')
    cy.log('Check that deleted measurement is gone (must use does not equal instead of does not contain because a ' +
            'measurement of 0mg will be true if the value is 50mg)')
    cy.get('#historyItemTitle', { timeout: 40000 })
            .should('not.contain', treatmentStringEditedNoQuotes)
  })
    // Randomly fails and can't reproduce locally
  it('Records a treatment measurement and checks history', function () {
    recordTreatmentMeasurementAndCheckHistoryPage()
  })
})
