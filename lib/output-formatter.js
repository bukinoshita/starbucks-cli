'use strict'

const chalk = require('chalk')

const outputFormatter = list => {
  for (let i = 0; i <= 5; i++) {
    const name = chalk.bold.blue(`\n ${list.stores[i].name}`)
    const isOpen = list.stores[i].open ? 'Open today' : 'Closed now'
    const hours = list.stores[i].schedule[0].hours
    const address = list.stores[i].addressLines[0]
    const divider = '-------------------------'
    const storeHours = `${chalk.bold('🕐  Hours:')} ${isOpen} — ${hours}`
    const storeAddress = `${chalk.bold('📍  Address:')} ${address}`

    console.log(`${name}
${divider}
${storeHours}
${storeAddress}
    `)
  }
}

module.exports = outputFormatter
