# Using SASS/SCSS

The option to use SASS/SCSS is now available. You are still able to write regular CSS if you wish, but must follow the instructions below as there have been a few minor change to the directory structure.

## What is SASS?
SASS stands for Syntactically Awesome Style Sheets. It does lots of awesome things that aren't possible in regular CSS. You have the ability to use variables and do math in your CSS, among many other things. SASS can simplify your workflow immensely, and makes maintaining stylesheets for large projects a lot less painful. 

More information about SASS can be found at: [http://sass-lang.com/guide](http://sass-lang.com/guide)

## Editing Styles
1. Navigate to `www/scss/partials`
2. Create a new file that has the name of the HTML template you wish to alter (if it doesn't already exist), precede it with a `_` and with the `.scss` file extension.

    Example: `_variable-settings.scss`

3. Go to the `www/scss/app.scss`. You will see a comment that says `// Partials` followed by a list of import statements. At the bottom of the list add `@import 'your-file-name';` The `_` and `.scss` extension must be omitted. 
4. Run `gulp watch` from the command line. This will do two things:

    First, take all files in the `www/scss` directory and merge them into one minified file thanks to the import statements in `www/scss/app.scss`. This file is called `app.min.css` and is located at `www/css/app.min.css`. The benefit of doing this is only one HTTP request has to be made in order to load all of your stylesheets into the project.

    Secondly, Gulp will watch the `www/scss` directory for any file changes and automatically refresh your browser.

5. Write your CSS or SCSS
6. Save all files you edited *twice* (normally you only have to save once but since Ionic refreshes the browser on file changes, you have to save your file a second time).