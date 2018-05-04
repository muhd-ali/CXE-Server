const FixersManager = require('./FixersManager.js').FixersManager
const ReportsProcessor = require('./ReportsProcessor.js').ReportsProcessor
const WebClientsManager = require('./WebClientsManager.js').WebClientsManager

function prettyPrint(obj) {
  const str = JSON.stringify(obj, null, 2)
  console.log(str)
}

class CXEServer {
  constructor(port) {
    this.port = port
    this.bodyParser = require('body-parser')
  }

  start() {
    this.setupNetworkPackages()
    this.addExpressAppCallbacks()
    this.startHTTPServer()
  }

  setupNetworkPackages() {
    const express = require('express')
    this.expressApp = express()
    this.http = require('http').createServer(this.expressApp)
    const socketIO = require('socket.io')(this.http)
    const fixersManager = new FixersManager(socketIO)
    const webClientsManager = new WebClientsManager(socketIO)
    this.reportsProcessor = new ReportsProcessor({fixersManager, webClientsManager})
  }

  addExpressAppGetIndexCallback() {
    this.expressApp.get('/index.html', (request, response) => {
      response.sendFile(__dirname + '/index.html')
    })
  }

  addExpressAppPostReportCallback() {
    const jsonParser = this.bodyParser.json()
    this.expressApp.post('/report', jsonParser, (request, response) => {
      const data = request.body
      prettyPrint(data)
      this.reportsProcessor.addReport(data.report)
      response.sendStatus(200)
    })
  }

  addExpressAppCallbacks() {
    this.addExpressAppGetIndexCallback()
    this.addExpressAppPostReportCallback()
  }

  startHTTPServer() {
    this.http.listen(this.port, () => {
      console.log('listening on ' + this.port)
    })
  }
}

function main() {
  const PORT = 8000
  const server = new CXEServer(PORT)
  server.start()
}

main()
