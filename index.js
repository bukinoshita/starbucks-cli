#!/usr/bin/env node
'use strict'

const meow = require('meow')
const updateNotifier = require('update-notifier')
const ora = require('ora')
const starbucks = require('starbucks-store-finder')
const wer = require('wer')
const shoutMessage = require('shout-message')
const { grey, yellow } = require('chalk')

const rightPad = require('./lib/right-pad')
const google = require('./geodata')

require('dotenv').config();

const cli = meow(
  `
  Usage:
    $ starbucks                    Show Starbucks stores near you
    $ starbucks <address>          Show Starbucks stores near address
    $ starbucks <zipcode>          Show Starbucks stores near zipcode

  Example:
    $ starbucks
    $ starbucks '1201 S Figueroa St, Los Angeles, CA 90015, USA'
    $ starbucks 'M6K 3P6' --limit=50

  Options:
    -l, --limit                    Limit of Starbucks to be shown
`,
  {
    alias: {
      l: 'limit',
      h: 'help',
      v: 'version'
    }
  }
)

updateNotifier({ pkg: cli.pkg }).notify()

const run = async () => {
  const input = cli.input[0]
  const spinner = ora('Finding Starbucks...')
  const limit = cli.flags.l || 10

  let lat
  let lng
  let city
  let region
  let country

  spinner.start()

  if (input) {
    if (!process.env.GOOGLE_MAP_API_KEY) {
      spinner.stop()
      return shoutMessage(`${yellow("You should set env key..")}`)
    }

    const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;
    const location = await google(input, { key: GOOGLE_MAP_API_KEY })

    lat = location.features[0].geometry.coordinates[0]
    lng = location.features[0].geometry.coordinates[1]
    city = location.features[0].properties.administrative_area_level_2
    region = location.features[0].properties.administrative_area_level_1
    country = location.features[0].properties.country
  } else {
    const location = await wer()

    lat = location.lat
    lng = location.long
    city = location.city
    region = location.region
    country = location.country
  }

  try {
    const options = { lat, lng, city, region, country }
    const stores = await starbucks(options)

    spinner.stop()

    if (stores.length > 0) {
      console.log(
        `${grey(rightPad('Name', 40))} ${grey(rightPad('Address', 50))} ${grey(
          rightPad('Open')
        )}`
      )

      stores.map((res, index) => {
        if (index < limit) {
          const store = {
            name: res.name,
            address: res.address.streetAddressLine1,
            city: res.address.city,
            region: res.address.countrySubdivisionCode,
            county: res.address.countyCode,
            isOpen: res.openStatusText,
            schedule: res.schedule
          }

          console.log(
            `${rightPad(store.name, 40)} ${rightPad(
              store.address,
              50
            )} ${rightPad(store.isOpen)}`
          )
        }

        return false
      })

      return false
    }

    return shoutMessage(`Couldn't find any Starbucks store near you...`)
  } catch (err) {
    spinner.stop()
    console.log(err)
  }
}

run()
