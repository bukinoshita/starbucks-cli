#!/usr/bin/env node
'use strict'

const meow = require('meow')
const updateNotifier = require('update-notifier')
const geocoder = require('geocoder')
const ora = require('ora')
const starbucks = require('starbucks')
const chalk = require('chalk')

const cli = meow(`
  Usage:
    $ starbucks <address>          Show 5 nearst Starbucks with address
    $ starbucks <zipcode>          Show 5 nearst Starbucks with zipcode

  Example:
    $ starbucks '1201 S Figueroa St, Los Angeles, CA 90015, USA'
    $ starbucks 'M6K 3P6'
`)

updateNotifier({pkg: cli.pkg}).notify()
const spinner = ora('Finding Starbucks...')

const run = () => {
  spinner.start()

  if (cli.input[0]) {
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

          for (let i = 0; i <= 5; i++) {
            const name = chalk.bold.blue(`\n ${list.stores[i].name}`)
            const isOpen = list.stores[i].open ? 'Open today' : 'Closed now'
            const hours = list.stores[i].schedule[0].hours
            const address = list.stores[i].addressLines[0]
            const divider = '-------------------------'
            const storeHours = `${chalk.bold('Hours:')} ${isOpen} — ${hours}`
            const storeAddress = `${chalk.bold('Address:')} ${address}`

            console.log(`${name}
${divider}
${storeHours}
${storeAddress}
            `)
          }

          spinner.stop()
        })
    })
  } else {
    cli.showHelp()
  }
}

run(cli)
