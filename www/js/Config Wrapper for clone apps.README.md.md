A configuration object "appSettings" is available in /js/config.js for changing the wrapper of the app. Following are the variables that can be configured for a new app:    

1. "app_name" : This will change the name of the app on Top header & on welcome card.

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436306460/header_lcaxwn.png)

2. "primary_outcome_variable" : Tracking factor that the app will track, changing this will  replace the word mood with provided value.

3. "primary_outcome_variables_options_labels" : array of primary outcome variable options, the elements of this array will be displayed on the x-axis of the graph

4. "primaryOutcomeVariableRatingOptions" : Array of objects, this will dynamically generate the reporting card with provided options and images.

5. "welcome_text" : This text will be displayed on first line of welcome card on welcome screen 

6. "tracking_question" : will be displayed above primary outcome variable reporting card

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436307683/welcome_card_i8dvgr.png)

7. "factor_average_text" : "indicating average value of the primary outcome variable.

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436308086/average_rqvqb7.png)

This is how configuration wrapper for MoodiModo looks like

```json
config.appSettings  = {
    app_name : 'MoodiModo', // This will change the name of the app on Top header
    primary_outcome_variable : 'Mood', // Tracking factor that the app will track,
    primary_outcome_variables_options_labels : [ 'Depressed', 'Sad', 'OK', 'Happy', 'Ecstatic' ] , //tracking facotor options, the elements of this array will be displayed on the x-axis of the graph
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
    welcome_text:"Let's start off by reporting your first mood on the card below", // This text will be displayed on first line of welcome card on welcome screen
    tracking_question:"How are you feeling right now?", // will be displayed above primary outcome variable reporting card
    factor_average_text:"Your average mood is "

}
```