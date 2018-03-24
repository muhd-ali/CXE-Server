class CXEServer {
  constructor(port) {
    this.port = port
    this.bodyParser = require('body-parser')
  }

  start() {
    this.setupNetworkPackages()
    this.addExpressAppCallbacks()
    this.addFixerSocketIOEvents()
    this.startHTTPServer()
  }

  setupNetworkPackages() {
    const express = require('express')
    this.expressApp = express()
    this.http = require('http').Server(this.expressApp)
    const socketIO = require('socket.io')(this.http)
    this.fixerSocketIO =
      socketIO.of('/fixerSocketIO')
  }

  addExpressAppGetIndexCallback() {
    this.expressApp.get('/index.html', (request, response) => {
      response.sendFile(__dirname + '/index.html')
    })
  }

  prettyPrint(obj) {
    const str = JSON.stringify(obj, null, 2)
    console.log(str)
  }

  addExpressAppPostReportCallback() {
    const jsonParser = this.bodyParser.json()
    this.expressApp.post('/report', jsonParser, (request, response) => {
      const report = request.body
      response.sendStatus(200)
      this.prettyPrint(report)
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

  addFixerSocketIOConnectEvent() {
    this.fixerSocketIO.on('connection', socket => {
      console.log('a client connected')
      socket.emit('hi', 'hello')
      this.addFixerSocketEventsOn(socket)
    })
  }

  addFixerSocketEventsOn(socket) {
    this.addFixerSocketLocationUpdateEvent(socket)
  }

  addFixerSocketLocationUpdateEvent(socket) {
    socket.on('location', data => {
      if ('location' in socket) {
        socket.location = data
      } else {
        socket.location = data
      }
    })
  }

  addFixerSocketIOEvents() {
    this.addFixerSocketIOConnectEvent()
  }
}

function main() {
  const PORT = 8000
  const server = new CXEServer(PORT)
  server.start()
}

main()
