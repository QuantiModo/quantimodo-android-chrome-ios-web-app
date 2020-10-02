// @ts-ignore
const Quantimodo = require('quantimodo')
const defaultClient = Quantimodo.ApiClient.instance
// Configure API key authorization: access_token
const access_token = defaultClient.authentications['access_token']

access_token.apiKey = 'demo'
let loginUrl = 'https://tigerview.ecusd7.org/HomeAccess/Account/LogOn?ReturnUrl=%2fhomeaccess'
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//access_token.apiKeyPrefix['access_token'] = "Token"
// Configure OAuth2 access token for authorization: quantimodo_oauth2
const quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2']

quantimodo_oauth2.accessToken = 'demo'
function logIntoTigerView () {
  cy.visit(loginUrl)
  cy.get('#SignInSectionContainer > .sg-content > .verification-option-container > .sg-row > #LogOnDetails_UserName')
        .type(Cypress.env('TIGERVIEW_TEST_USER'))
  cy.get('#SignInSectionContainer > .sg-content > .verification-option-container > .sg-row > #LogOnDetails_Password')
        .type(Cypress.env('TIGERVIEW_TEST_PASSWORD'))
  cy.get('#SignInSectionContainer > .sg-content > .sg-button').click()
  cy.visit('https://tigerview.ecusd7.org/HomeAccess/Home/WeekView')
}
/**
 * @param {any[] | HTMLCollectionOf<HTMLTableRowElement>} rows
 */
function getCellIndexToHeaderMap (rows) {
  let cellIndexToHeaderMap = []
  let headerRow = rows[0]
  let cells = headerRow.cells

  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i]
    let lineArray = cell.innerText.split('\n')

    if (lineArray[1]) {
      let year = new Date().getFullYear()

      cellIndexToHeaderMap[i] = `${year}/${lineArray[1]}`
    } else {
      cellIndexToHeaderMap[i] = cell.innerText
    }
  }

  return cellIndexToHeaderMap
}
/**
 * @param {HTMLTableDataCellElement | HTMLTableHeaderCellElement} currentAverageCell
 * @param {any} courseName
 */
function getCurrentAverageMeasurement (currentAverageCell, courseName) {
  let measurement = getGoalPercentMeasurement()

  measurement.value = currentAverageCell.innerText
  measurement.variableName = `Current Average Grade for ${courseName}`
  measurement.url = currentAverageCell.baseURI

  return measurement
}
/**
 * @param {number} date
 */
function getTardyMeasurement (date) {
  let measurement = getGoalPercentMeasurement()

  measurement.duration = 3600
  measurement.fillingValue = 0
  measurement.startTime = date
  measurement.unitAbbreviatedName = 'count'
  measurement.value = 1
  measurement.variableName = 'Tardy for Class'

  return measurement
}
function getGoalPercentMeasurement () {
  let measurement = new Quantimodo.Measurement()

  measurement.unitAbbreviatedName = '%'
  measurement.variableCategoryName = 'Goals'
  measurement.duration = 86400
  measurement.sourceName = 'TigerView'
  measurement.startTime = Math.ceil(Date.now() / 1000 / 86400) * 86400

  return measurement
}
/**
 * @param {any} grade
 * @param {any} courseName
 * @param {number} date
 * @param {string} assignment
 */
function getDailyAverageMeasurement (grade, courseName, date, assignment) {
  let measurement = getGoalPercentMeasurement()

  measurement.value = grade
  measurement.variableName = `Daily Grade for ${courseName}`
  measurement.startTime = date
  measurement.note = assignment

  return measurement
}
/**
 * @param {any[] | HTMLCollectionOf<HTMLTableDataCellElement | HTMLTableHeaderCellElement>} cells
 */
function getCourseName (cells) {
  let courseNameCell = cells[0]
  let courseName = courseNameCell.innerText.split('\n')[0]

  courseName = courseName.replace(/[0-9]/g, '')

  return courseName
}
/**
 * @param {any[] | string[]} lines
 */
function getGrade (lines) {
  let grade = lines[1]

  if (grade.indexOf('Z') !== -1) {
    return 0
  }

  grade = eval(grade)
  grade = grade * 100

  return grade
}
describe('tigerview', function () {
  it('tigerview', function () {
    logIntoTigerView()
    cy.get('table').then(function (tables) {
      let table = tables[0]
      let rows = table.rows
      let body = []

      let columnIndexToHeaderMap = getCellIndexToHeaderMap(rows)

      for (let i = 1; i < rows.length; i++) {
        let row = rows[i]
        let cells = row.cells
        let courseName = getCourseName(cells)
        let currentAverageCell = cells[1]
        let currentAvgGrade = currentAverageCell.innerText

        if (currentAvgGrade === '') { // Empty for study hall
          continue
        }

        let measurement = getCurrentAverageMeasurement(currentAverageCell, courseName)

        body.push(measurement)
        for (let column = 2; column < cells.length; column++) {
          let dayGradeCell = cells[column]
          let date = columnIndexToHeaderMap[column]
          // Add 12 hours because it uses UTC time which is yesterday (midnight minus 5 hours)
          let startTime = Math.round(new Date(date).getTime() / 1000) + 86400 / 2
          let assignmentAndGrade = dayGradeCell.innerText

          if (assignmentAndGrade === '') {
            console.log(`no ${courseName} grade for ${date}`)
            continue
          }

          console.log(`assignmentAndGrade for ${courseName} for ${date}`)
          let lines = assignmentAndGrade.split('\n')

          if (lines[0].indexOf('TARDY') !== -1) {
            body.push(getTardyMeasurement(startTime))
            lines.shift()
          }

          let assignment = lines[0]
          let grade = getGrade(lines)
          let dailyCourseGrade = getDailyAverageMeasurement(grade, courseName, startTime, assignment)

          body.push(dailyCourseGrade)
        }
      }
      // noinspection JSUnusedLocalSymbols
      let callback = /**
             * @param {any} error
             * @param {any} data
             * @param {any} _response
             */
          // eslint-disable-next-line no-unused-vars
            function (error, data, _response) {
              if (error) {
                console.error(error)
              } else {
                console.log(`API called successfully. Returned data: ${data}`)
              }
            }
      let api = new Quantimodo.MeasurementsApi()

      api.postMeasurements(body, { userId: 1 }, callback)
    })
  })
})

