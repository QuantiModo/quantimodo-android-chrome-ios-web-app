A configuration object "appSettings" is available in /js/config.js for changing the wrapper of the app. Following are the variables that can be configured for a new app:    

1. "app_name" : This will change the name of the app on Top header & on welcome card.

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436306460/header_lcaxwn.png)

2. "tracking_factor" : Tracking factor that the app will track, changing this will  replace the word mood with provided value.

3. "tracking_factors_options_labels" : array of tracking factor options, the elements of this array will be displayed on the x-axis of the graph

4. "tracking_factor_options" : Array of objects, this will dynamically generate the reporting card with provided options and images.

5. "welcome_text" : This text will be displayed on first line of welcome card on welcome screen 

6. "tracking_question" : will be displayed above tracking factor reporting card

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436307683/welcome_card_i8dvgr.png)

7. "factor_average_text" : "indicating average value of the tracking factor.

    ![alt tag](http://res.cloudinary.com/loops-inc/image/upload/v1436308086/average_rqvqb7.png)

This is how configuration wrapper for MoodiModo looks like

```json
config.appSettings  = {
    app_name : 'MoodiModo', // This will change the name of the app on Top header
    tracking_factor : 'Mood', // Tracking factor that the app will track,
    tracking_factors_options_labels : [ 'Depressed', 'Sad', 'OK', 'Happy', 'Ecstatic' ] , //tracking facotor options, the elements of this array will be displayed on the x-axis of the graph
    tracking_factor_options : [ //Tracking factor options with images.
        {
            value: 'mood_depressed',
            img: 'img/ic_mood_depressed.png'
        },
        {
            value: 'mood_sad',
            img: 'img/ic_mood_sad.png'
        },
        {
            value: 'mood_ok',
            img: 'img/ic_mood_ok.png'
        },
        {
            value: 'mood_happy',
            img: 'img/ic_mood_happy.png'
        },
        {
            value: 'mood_ecstatic',
            img: 'img/ic_mood_ecstatic.png'
        }


    ],
    welcome_text:"Let's start off by reporting your first mood on the card below", // This text will be displayed on first line of welcome card on welcome screen
    tracking_question:"How are you feeling right now?", // will be displayed above tracking factor reporting card
    factor_average_text:"Your average mood is "

}
```