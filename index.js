#!/usr/bin/env node
'use strict'

const meow = require('meow')
const updateNotifier = require('update-notifier')
const geocoder = require('geocoder')
const ora = require('ora')
const starbucks = require('starbucks')
const wer = require('wer')
const outputFormatter = require('./lib/output-formatter')

const cli = meow(`
  Usage:
    $ starbucks                    Show 5 Starbucks near you
    $ starbucks <address>          Show 5 nearst Starbucks with address
    $ starbucks <zipcode>          Show 5 nearst Starbucks with zipcode

  Example:
    $ starbucks
    $ starbucks '1201 S Figueroa St, Los Angeles, CA 90015, USA'
    $ starbucks 'M6K 3P6'
`)

updateNotifier({pkg: cli.pkg}).notify()
const spinner = ora('Finding Starbucks...')

const run = () => {
  if (cli.flags.h) {
    cli.showHelp()
  } else if (cli.input[0]) {
    spinner.start()
    const input = cli.input[0]

    geocoder.geocode(input, (err, {results}) => {
      const {lat, lng} = results[0].geometry.location
      const opts = {lat, lng}

      if (err) {
        return err
      }

      starbucks(opts)
        .then(res => {
          const list = JSON.parse(res)
          outputFormatter(list)
          spinner.stop()
        })
        .catch(err => {
          spinner.stop()
          console.log(err)
        })
    })
  } else {
    spinner.start()
    wer().then(({latitude, longitude}) => {
      const opts = {lat: latitude, lng: longitude}

      starbucks(opts)
        .then(res => {
          const list = JSON.parse(res)
          outputFormatter(list)
          spinner.stop()
        })
        .catch(err => {
          spinner.stop()
          console.log(err)
        })
    })
  }
}

run(cli)
