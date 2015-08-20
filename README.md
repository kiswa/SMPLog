#SMPLog

SMPLog is a Markdown-based minimalist blog application. It has been developed
with a mobile-first point of view, and works well on any device.

## Install

 1. Clone the repo: `git clone https://github.com/kiswa/SMPLog`
 2. Install dependencies: `./dev-setup` or `bower install && npm install &&
 ./composer.phar install`
 3. Build SMPLog: `gulp`

After building, the `dist` directory has all the files needed to run SMPLog.
Copy it to wherever you want it and start using SMPLog.

**Note:** If you are using SMPLog in a sub-directory (e.g. `yoursite.tld/blog`),
you will need to update the `index.html` file in `dist`. Change the
`<base href="/">`, to use your base location (in this case, it would be
`<base href="/blog/">`).

If you want to develop on SMPLog, you can run `gulp watch` and changes will be
updated to your browser if you have the
[fb-flo plugin](https://facebook.github.io/fb-flo) installed.

### Database

By default, SMPLog uses SQLite for the database. However, you can use just
about anything. Take a look at the documentation for
[RedBeanPHP](http://redbeanphp.com/connection) and change line 32 of
`api/api.php` to use the setup you prefer.

## First Use

Go to the url for your install with `admin` added to the end. For example,
`http://example.com/blog/admin`. The first time, you can log in with the
username `admin` and password `admin`.

It is recommended you then visit the `Settings` link and change your password.

While you're in `Settings`, the admin user can change the title of the blog,
set the background image for the header section, and update the description
used in the RSS feed.

All users can change their displayed name and author image. Password changing
is also always available.

The `New Post` tab allows you to enter a new post using
[Markdown](http://commonmark.org), with a live preview next to it. When on
mobile, the preview appears beneath the new post form.

### Admin User

The admin user is the only one that can create and remove other users, and
update the Blog Details (these sections do not display for standard users).
There is only one admin user.

Removing a user sets them as inactive, and all posts by that user are marked
unpublished. The user and posts will still exist in the database. It is planned
to allow the admin user to manage this, but for now you can access the database
if any of the removed user's data is needed.

### Post Display

It is worth mentioning that the short text displayed on pages where posts are
listed is created by pulling the first paragraph of text from the post. This
means if the first thing in your post is `# Some Header Text`, then the short
text will be `Some Header Text` and not the first actual paragraph.

## Planned Features

There are a few features that might make this more useful, which are planned for
further development.

 * Create "tags" for posts
 * Use "tags" to display posts
 * Removed user data management

## Tech Used

This project was made possible by the following open source projects:

### Front End
 * [AngularJS](http://angularjs.org) (including angular-route, angular-animate,
 and angular-sanitize)
 * [Bourbon](http://bourbon.io) & [Neat](http://neat.bourbon.io) - A few handy
 mixins and responsive grid system
 * [Font Awesome](http://fortawesome.github.io/Font-Awesome) - Font icons,
 of course
 * [highlight.js](https://highlightjs.org) - Syntax highlighting for the Web
 * [marked](https://github.com/chjj/marked) - A fast JavaScript Markdown parser
 * [normalize.css](https://necolas.github.io/normalize.css) - A modern,
 HTML5-ready alternative to CSS resets

### Back End
 * [Slim](http://www.slimframework.com) - A PHP micro framework to quickly write
 powerful web apps and APIs
 * [RedBeanPHP](http://www.redbeanphp.com) - An ORM-like tool to easily store
 objects in a database
 * [PHP-JWT](https://github.com/firebase/php-jwt) - A simple library to encode
 and decode JSON Web Tokens in PHP
 * [Markdown](https://github.com/cebe/markdown) - A super fast markdown parser
 for PHP (used to generate RSS)

## Code Counts

Because I find it interesting, even if it's not a good metric.

|Language                 |  Files       | Blank      |   Comment    |  Code  |
|-------------------------|:------------:|:----------:|:------------:|:------:|
|Javascript               |   16         |  242       |      1       |  1046  |
|SASS                     |    8         |  153       |      1       |   711  |
|PHP                      |    9         |  192       |     17       |   601  |
|HTML                     |   10         |   16       |      0       |   291  |
|**SUM:**                 | **43**       |**603**     |   **19**     |**2649**|

Last updated August 20, 2015
