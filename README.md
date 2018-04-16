# Easy Parallax

## Usage

Install npm / yarn package

```
$ npm install easy-parallax
$ yarn add easy-parallax
```

Create EasyParallax stage and add Parallax elements:

```javascript
const stage = new EasyParallax(window)
const element = document.getElementById("#parallax")
stage.add(element, { speed: 0.5, type: 'scroll' })
```

## Development

```
$ npm install --global gulp
$ gulp dist
```

The result is available in the `dist/` folder.

## License

MIT
