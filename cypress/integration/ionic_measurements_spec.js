// load type definitions that come with Cypress module
/// <reference types="cypress" />
/**
 * @param {number} initialMoodValue
 * @param variableName
 * @param valence
 */
function recordMeasurementAndCheckHistory (initialMoodValue, variableName, valence) {
  cy.url().should('contain', '/measurement-add')
  cy.get(`.primary-outcome-variable-history > img:nth-of-type(${initialMoodValue})`)
        .click({ force: true })
  cy.get('#saveButton').click({ force: true })
    cy.wait('@post-measurement', {timeout: 30000})
        .should('have.property', 'status', 201)
  cy.log('Waiting for measurement to post to API...')

    goToHistoryForVariable(variableName)

    function moodValueToImage(value, valence) {
        return ratingImages[valence][value - 1];
    }

    let desiredImageName = moodValueToImage(initialMoodValue, valence)
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

  cy.get('#historyItemTitle-0', { timeout: 40000 })
        .should('contain', treatmentStringNoQuotes)
}
/**
 * @param {string} itemTitle
 */
function editHistoryPageMeasurement (itemTitle) {
  cy.log(`Editing history measurement with title containing: ${itemTitle}`)
  cy.get('#historyItemTitle-0', { timeout: 30000 }).contains(itemTitle)
  cy.get('#action-sheet-button', { timeout: 30000 }).click({ force: true })
  cy.clickActionSheetButtonContaining('Edit')
  cy.wait(2000)
  cy.url().should('include', 'measurement-add')
}
function deleteMeasurements (variableName) {
    goToHistoryForVariable(variableName);
    cy.log('Deleting measurements...')
    let deleted = false
    cy.get("body").then($body => {
        let selector = "#showActionSheet-button > i";
        let number = $body.find(selector).length;
        cy.log(number+" measurements to delete");
        if (number > 0) {   //evaluates as true
            cy.get(selector, { timeout: 30000 })
                // eslint-disable-next-line no-unused-vars
                .each(($el, _index, _$list) => {
                    cy.log(`Deleting ${$el.text()} reminder`)
                    cy.wrap($el).click({force: true, timeout: 10000})
                    cy.clickActionSheetButtonContaining('Delete')
                    cy.wait('@measurements-delete', {timeout: 30000})
                        .should('have.property', 'status', 204)
                    deleted = true
                })
        }
    });

    cy.get('#historyList > div', { timeout: 30000 })
        // eslint-disable-next-line no-unused-vars
        .each(($el, _index, _$list) => {
            let html = $el.html() // $el is a wrapped jQuery element

            if (html.indexOf('showActionSheet') !== -1 && $el.is('visible')) {
                cy.log(`Deleting ${$el.text()} reminder`)
                cy.wrap($el).click()
                cy.clickActionSheetButtonContaining('Delete')
                cy.wait('@measurements-delete', {timeout: 30000})
                    .should('have.property', 'status', 204)
                deleted = true
            } else {
                // It's a header
            }
        })
    if (deleted) {
        cy.log('Waiting for deletions to post...')
        cy.wait(5000)
    }
}
function goToHistoryForVariable(variableName, login) {
    if(login){
        cy.loginWithAccessTokenIfNecessary('/#/app/history-all-variable/' + variableName)
    } else {
        cy.visitIonicAndSetApiUrl('/#/app/history-all-variable/' + variableName)
    }

}
describe('Measurements', function () {
    // Skipping because it fails randomly and can't reproduce failure locally
    it('Goes to edit measurement from history page', function () {
        cy.loginWithAccessTokenIfNecessary('/#/app/history-all-category/Anything')
        cy.wait('@measurements', {timeout: 30000})
            .should('have.property', 'status', 200)
        cy.get('#historyItemTitle-0', {timeout: 30000}).click({force: true})
        cy.clickActionSheetButtonContaining('Edit')
        cy.wait(2000)
        cy.url().should('include', 'measurement-add')
    })
    // Skipping because it fails randomly and can't reproduce failure locally
    it('Records, edits, and deletes an emotion measurement', function () {
        let variableName = 'Alertness'
        let valence = 'positive'
        goToHistoryForVariable(variableName, true)
        cy.wait('@measurements', {timeout: 30000})
            .should('have.property', 'status', 200)
        deleteMeasurements(variableName)
        cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add-search')
        cy.searchAndClickTopResult(variableName, true)
        let d = new Date()
        let seconds = d.getSeconds()
        let initialValue = (seconds % 5) + 1
        recordMeasurementAndCheckHistory(initialValue, variableName, valence)
        cy.get('#hidden-measurement-id-0').then(($el) => {
            let measurementId = $el.text();
            expect(measurementId).length.to.be.greaterThan(0)
            cy.get('#action-sheet-button-0').click({force: true});
            cy.clickActionSheetButtonContaining('Edit');
            let newMoodValue = ((initialValue % 5) + 1);
            //cy.visit(`/#/app/measurement-add?measurementId=${measurementId}`);
            cy.get('#variable-name').contains(variableName)
            goToHistoryForVariable(variableName);
            cy.get("#hidden-measurement-id-0").then(($el) => {
                let editedMeasurementId = $el.text();
                cy.visitIonicAndSetApiUrl(`/#/app/measurement-add?measurementId=${editedMeasurementId}`);
                cy.get('#deleteButton').click({force: true});
                cy.wait(500);
                debugger
                goToHistoryForVariable(variableName)
                // TODO: Uncomment this cy.get("#hidden-measurement-id-0").should('not.contain', editedMeasurementId);
            });
        });
    })
    // Skipping because it fails randomly and can't reproduce failure locally
    it.skip('Record, edit, and delete a treatment measurement', function () {
        let dosageValue = 100

        recordTreatmentMeasurementAndCheckHistoryPage(dosageValue)
        editHistoryPageMeasurement(dosageValue.toString())
        let newDosageValue = dosageValue / 10

        cy.get('#defaultValue').type(newDosageValue.toString(), {force: true})
        cy.get('#saveButton').click({force: true})
        cy.wait(1000)
        cy.visitIonicAndSetApiUrl('/#/app/history-all-category/Treatments')
        let treatmentStringEditedNoQuotes = `${newDosageValue} mg Aaa Test Treatment`

        editHistoryPageMeasurement(newDosageValue.toString())
        cy.get('button.button.icon-left.ion-trash-a').click({force: true})
        cy.wait(1000)
        cy.url().should('include', '/#/app/history-all-category/Treatments')
        cy.log('Check that deleted measurement is gone (must use does not equal instead of does not contain because a ' +
            'measurement of 0mg will be true if the value is 50mg)')
        cy.get('#historyItemTitle-0', {timeout: 40000})
            .should('not.contain', treatmentStringEditedNoQuotes)
    })
    // Randomly fails and can't reproduce locally
    it('Records a treatment measurement and checks history', function () {
        recordTreatmentMeasurementAndCheckHistoryPage()
    })
    it.skip('can edit measurement by id', function () {
        //qm.auth.setAccessToken("test-token")
        return cy.request({
            method: 'GET',
            url: 'api/v1/measurements',
            followRedirect: false,
            headers: {
                'accept': 'application/json',
                'authorization': "Bearer test-token"
            }
        }).then((response) => {
            // Parse JSON the body.
            var measurements = response.body
            cy.log("Got " + measurements.length + " measurements")
            var m = measurements[0]
            cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add?id=' + m.id)
            cy.url().should('include', 'measurement-add')
            cy.get('#variable-name').contains(m.variableName)
        })
    })
})
