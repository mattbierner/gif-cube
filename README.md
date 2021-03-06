# Gif Cube

Source for [*Gif Cube*][site]

# Building
The website is a TypeScript React app atop Jekyll

## Structure

- `shared` — Shared sources between client and server side components
    - `src` — TypeScript source

- `website` — Main website code
    - `src` - Main TypeScript React source

## Building the website

To build the site itself, make sure have [Jekyll installed](https://jekyllrb.com) and then:

```bash
cd website
jekyll server
```

To build the client side components:

```bash
$ cd website
$ npm install
$ npm run build

# Or in watch mode
$ npm run build -- --watch

# Or a minified production build
$ npm run build:prod
```


[site]: https://gif-cube.com