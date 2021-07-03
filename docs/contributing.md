# Contributing

We love pull requests and would be very grateful if you'd help us abolish suffering with data!

[ ] [Fork](https://help.github.com/articles/fork-a-repo/) a copy of the repo to your own Github account.

[ ] [Clone](https://help.github.com/articles/cloning-a-repository/) your forked version of the repo locally.
(Ideally, use a powerful GUI git client like [SourceTree](https://www.sourcetreeapp.com/). The command line is for
barbarians.)

If you must use the command line, you can use these:

```
git clone git@github.com:your-username/quantimodo-android-chrome-ios-web-app.git
```

Set up a branch for your feature or bugfix with a link to the original repo:

```
git checkout -b my-awesome-new-feature
git push --set-upstream origin my-awesome-new-feature
git remote add upstream https://github.com/QuantiModo/quantimodo-android-chrome-ios-web-app.git
```

Commit changes:

```
git commit -m "Cool stuff"
```

Make sure your branch is up to date with the original repo:

```
git fetch upstream
git merge upstream/master
```

Review your changes and any possible conflicts and push to your fork:

```
git push origin
```

[Submit a pull request on Github.com](https://help.github.com/articles/creating-a-pull-request/).

At this point you're waiting on me. I do my best to keep on top of all the pull requests. I may suggest some changes,
improvements or alternatives.

Some things that will increase the chance that your pull request is accepted:

- Write tests.
- Write a [good commit message](http://chris.beams.io/posts/git-commit/).
- Make sure the PR merges cleanly with the latest master.
- Describe your feature/bugfix and why it's needed/important in the pull request description.

## Editor Config

The project uses [.editorconfig](http://editorconfig.org/) to define the coding
style of each file. We recommend that you install the Editor Config extension
for your preferred IDE. Consistency is key.

## JSHint

The project uses [.jshint](http://jshint.com/docs) to define the JavaScript
coding conventions. Most editors now have a JSHint add-on to provide on-save
or on-edit linting.

### Install JSHint for vim

1. Install [jshint](https://www.npmjs.com/package/jshint).
1. Install [jshint.vim](https://github.com/wookiehangover/jshint.vim).

### Install JSHint for Sublime

1. Install [Package Control](https://packagecontrol.io/installation)
1. Restart Sublime
1. Type `CMD+SHIFT+P`
1. Type _Install Package_
1. Type _JSHint Gutter_
1. Sublime -> Preferences -> Package Settings -> JSHint Gutter
1. Set `lint_on_load` and `lint_on_save` to `true`

### Tips

- I recommend using [SourceTree and the Gitflow model] (https://github.com/GSoft-SharePoint/Dynamite/wiki/Getting-started-with-SourceTree,-Git-and-git-flow) for development.

