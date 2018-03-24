class CXEServer {
  constructor(port) {
    this.port = port
    this.bodyParser = require('body-parser')
  }

  start() {
    this.setupNetworkPackages()
    this.addExpressAppCallbacks()
    this.addSocketIOEvents()
    this.startHTTPServer()
  }

  setupNetworkPackages() {
    let express = require('express')
    this.expressApp = express()
    this.http = require('http').Server(this.expressApp)
    this.socketio = require('socket.io')(this.http)
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
    let jsonParser = this.bodyParser.json()
    this.expressApp.post('/report', jsonParser, (request, response) => {
      let report = request.body
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

  addSocketIOConnectEvent() {
    this.socketio.on('connection', (socket) => {
      console.log('a user connected')
    })
  }

  addSocketIOEvents() {
    this.addSocketIOConnectEvent()
  }
}

function main() {
  let PORT = 8000
  let server = new CXEServer(PORT)
  server.start()
}

main()
