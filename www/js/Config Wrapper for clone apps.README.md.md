A configuration object "appSettings" is available in /js/config.js for changing the wrapper of the app. Following are the variables that can be configured for a new app:    

1. "appName" : This will change the name of the app on Top header & on welcome card.

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436306460/header_lcaxwn.png)

2. "primaryOutcomeVariable" : Tracking factor that the app will track, changing this will  replace the word mood with provided value.

3. "primaryOutcomeVariableRatingOptionLabels" : array of primary outcome variable options, the elements of this array will be displayed on the x-axis of the graph

4. "primaryOutcomeVariableRatingOptions" : Array of objects, this will dynamically generate the reporting card with provided options and images.

5. "welcomeText" : This text will be displayed on first line of welcome card on welcome screen

6. "primaryOutcomeVariableTrackingQuestion" : will be displayed above primary outcome variable reporting card

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436307683/welcome_card_i8dvgr.png)

7. "primaryOutcomeVariableAverageText" : "indicating average value of the primary outcome variable.

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436308086/average_rqvqb7.png)

This is how configuration wrapper for MoodiModo looks like

```json
config.appSettings  = {
    appName : 'MoodiModo', // This will change the name of the app on Top header
    primaryOutcomeVariable : 'Mood', // Tracking factor that the app will track,
    primaryOutcomeVariableRatingOptionLabels : [ 'Depressed', 'Sad', 'OK', 'Happy', 'Ecstatic' ] , //tracking facotor options, the elements of this array will be displayed on the x-axis of the graph
    primaryOutcomeVariableRatingOptions : [ //Tracking factor options with images.
        {
            value: 'face_depressed',
            img: 'img/ic_face_depressed.png'
        },
        {
            value: 'face_sad',
            img: 'img/ic_face_sad.png'
        },
        {
            value: 'face_ok',
            img: 'img/ic_face_ok.png'
        },
        {
            value: 'face_happy',
            img: 'img/ic_face_happy.png'
        },
        {
            value: 'face_ecstatic',
            img: 'img/ic_face_ecstatic.png'
        }


    ],
    welcomeText:"Let's start off by reporting your first mood on the card below", // This text will be displayed on first line of welcome card on welcome screen
    primaryOutcomeVariableTrackingQuestion:"How are you?", // will be displayed above primary outcome variable reporting card
    primaryOutcomeVariableAverageText:"Your average mood is "

}
```