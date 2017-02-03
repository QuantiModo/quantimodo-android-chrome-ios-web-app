Feature: New Login
  As a user
  I want to be able to log into the app
  To be able to use it in all its glory

  Scenario: Showing the login page
    Given I load the app
    Then I should see the login screen

  Scenario: Logging in
    Given I am on the login page
    When I enter correct details
    Then I successfully log in and see the home page