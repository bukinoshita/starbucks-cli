# starbucks-cli [![Build Status](https://travis-ci.org/bukinoshita/starbucks-cli.svg?branch=master)](https://travis-ci.org/bukinoshita/starbucks-cli)

> Starbucks store finder CLI :coffee:

**WARNING**: They closed their API, it won't work until find a workaround.


<img src="https://cldup.com/WPl4dTCrIh.jpg"/>

## Install
```
$ npm install -g starbucks-cli
```

## Usage
```bash
$ starbucks --help

Usage:
  $ starbucks                    Show 5 Starbucks near you
  $ starbucks <address>          Show 5 nearst Starbucks with address
  $ starbucks <zipcode>          Show 5 nearst Starbucks with zipcode

Example:
  $ starbucks
  $ starbucks '1201 S Figueroa St, Los Angeles, CA 90015, USA'
  $ starbucks 'M6K 3P6'
```

## Related
- [starbucks-store-finder](https://github.com/bukinoshita/starbucks-store-finder) — API for this module
- [wer](https://github.com/bukinoshita/wer) — Get your geolocation information :round_pushpin:

## License
[MIT](https://github.com/bukinoshita/starbucks-cli/blob/master/LICENSE) &copy; Bu Kinoshita
