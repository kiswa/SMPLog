# SMPLog

SMPLog is a Markdown-based minimalist blog application. It has been developed
with a mobile-first point of view, and works well on any device.

![SMPLog Editor](./.github/SMPLog.png)

## Install

 1. Clone the repo: `git clone https://github.com/kiswa/SMPLog`
 2. Install dependencies: `npm i`
 3. Build and minify SMPLog: `gulp && gulp minify`

After building, the `dist` directory has all the files needed to run SMPLog.
Copy it to wherever you want it and start using SMPLog.

**Note:** If you are using SMPLog in a sub-directory (e.g. `yoursite.tld/blog`),
you will need to update the `index.html` file in `dist`. Change the
`<base href="/">`, to use your base location (in this case, it would be
`<base href="/blog/">`).

If you want to develop on SMPLog, you can run `gulp watch` and changes will be
built automatically.

### Database

By default, SMPLog uses SQLite for the database. However, you can use just
about anything. Take a look at the documentation for
[RedBeanPHP](http://redbeanphp.com/connection) and change line 5 of
`api/index.php` to use the setup you prefer.

## First Use

Go to the url for your install with `admin` added to the end. For example,
`http://example.com/blog/admin`. The first time, you can log in with the
username `admin` and password `admin`.

It is recommended you then visit the `Settings` link and change your password.

While in `Settings`, the admin user can change the title of the blog,
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
unpublished. The user and posts still exist in the database. The admin user can
manage this, and re-instate a user and their posts.

### Post Display

It is worth mentioning that the short text displayed on pages where posts are
listed is created by pulling the first paragraph of text from the post. This
means if the first thing in your post is `# Some Header Text`, then the short
text will be `Some Header Text` and not the first actual paragraph.

## Development

If you plan to develop SMPLog, you will need to update the base href in
`src/index.html`to `<base href="/dist/">` and comment out the
`enableProdMode()` line in `main.ts` to get Angular debug output.

## Tech Used

This project was made possible by the following open source projects:

### Front End
 * [Angular](http://angular.io)
 * [Bourbon](http://bourbon.io) & [Neat](http://neat.bourbon.io) - A few handy
 mixins and responsive grid system
 * [Font Awesome](http://fortawesome.github.io/Font-Awesome) - Font icons,
 of course
 * [highlight.js](https://highlightjs.org) - Syntax highlighting for the Web
 * [marked](https://github.com/chjj/marked) - A fast JavaScript Markdown parser
 * [scss-base](https://github.com/kiswa/scss-base) - Minimal clean styles for SCSS projects

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

`cloc --exclude-dir=vendor,lib --exclude-ext=json src/`

### `src`

|Language                 |  Files       | Blank      |   Comment    |  Code  |
|-------------------------|:------------:|:----------:|:------------:|:------:|
|TypeScript               |   33         |  292       |      7       |  1277  |
|PHP                      |   10         |  286       |     13       |   798  |
|SASS                     |   11         |  158       |      2       |   705  |
|HTML                     |   10         |   58       |      0       |   456  |
|**SUM:**                 | **64**       |**794**     |   **22**     |**3236**|

`cloc --exclude-ext=xml test/`

### `test`

|Language                 |  Files       | Blank      |   Comment    |  Code  |
|-------------------------|:------------:|:----------:|:------------:|:------:|
|PHP                      |    6         |  399       |     13       |  1054  |
|JavaScript               |   21         |  236       |     21       |  1052  |
|**SUM:**                 | **27**       |**635**     |   **34**     |**2106**|

Last updated Dec. 15, 2016
