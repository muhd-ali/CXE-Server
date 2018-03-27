function prettyPrint(obj) {
  const str = JSON.stringify(obj, null, 2)
  console.log(str)
}

class Location {
  constructor(latitude, longitude) {
    this.latitude = latitude
    this.longitude = longitude
  }

  toRadians(x) {
    return x * Math.PI / 180
  }

  distanceFrom(location) {  // distance in meter using the Haversine formula
    const R = 6378137       // Earth’s mean radius in meter
    const dLat = this.toRadians(this.latitude - location.latitude)
    const dLong = this.toRadians(this.longitude - location.longitude)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(location.latitude)) * Math.cos(this.toRadians(this.latitude)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
  }
}

class FixersManager {
  constructor(socketIO) {
    this.fixerSocketIO =
      socketIO.of('/fixerSocketIO')
    this.addFixerSocketIOEvents()
  }

  setReportsProcessorTo(reportsProcessor) {
    this.reportsProcessor = reportsProcessor
  }

  connectedSockets() {
    const sockets = Object.values(this.fixerSocketIO.sockets)
    return sockets
  }

  addFixerSocketIOConnectEvent() {
    this.fixerSocketIO.on('connection', socket => {
      console.log('a fixer connected')
      this.reportsProcessor.assignNextReport()
      this.addFixerSocketEventsOn(socket)
    })
  }

  addFixerSocketIODisonnectEvent() {
    this.fixerSocketIO.on('disconnect', socket => {
      console.log('fixer disconnected')
    })
  }

  addFixerSocketEventsOn(socket) {
    this.addFixerSocketLocationUpdateEvent(socket)
  }

  addFixerSocketLocationUpdateEvent(socket) {
    socket.on('location', data => {
      const fixerData = {
        'location': new Location(data.latitude, data.longitude)
      }
      if ('fixerData' in socket) {
        socket.fixerData = fixerData
      } else {
        socket.fixerData = fixerData
      }
      this.reportsProcessor.assignNextReport()
      console.log('location updated')
    })
  }

  addFixerSocketIOEvents() {
    this.addFixerSocketIOConnectEvent()
    this.addFixerSocketIODisonnectEvent()
  }

  socketNearestTo(report) {
    const coord = report.location.gps
    const location = new Location(coord.latitude, coord.longitude)
    const sockets = this.connectedSockets()
    if (sockets.length > 0) {
      let nearest = sockets[0]
      sockets.forEach(socket => {
        if ('fixerData' in socket) {
          const distanceFromSocket = location.distanceFrom(socket.fixerData.location)
          const distanceFromNearest = location.distanceFrom(nearest.fixerData.location)
          if (distanceFromSocket < distanceFromNearest) {
            nearest = socket
          }
        }
      })
      if (nearest===sockets[0] &&'fixerData' in sockets[0]) {
        return nearest
      } else {
        return null
      }
    }
    return null
  }

  send(report) {
    // console.log(this.connectedSockets()
    //   .map(socket => socket.fixerData))
    const socket = this.socketNearestTo(report)
    if (socket != null) {
      socket.emit('newReport', report)
      return true
    } else {
      return false
    }
  }
}

class ReportsProcessor {
  constructor(fixersManager) {
    this.fixersManager = fixersManager
    this.fixersManager.setReportsProcessorTo(this)
    this.reports = {
      'pending': [
        {
          'note': 'This is first report',
          'department': {
            'server_id': '',
            'title': 'Electrical'
          },
          'location': {
            'specifics': {
              'Terminal': 'terminal 3',
              'Gate': 'gate 1'
            },
            'gps': {
              'latitude': 51.50998,
              'longitude': -0.1337
            }
          },
          'problemType': {
            'server_id': 'i11',
            'title': 'ATM Broken'
          }
        },
        {
          'note': 'This is another report',
          'department': {
            'server_id': '',
            'title': 'Cleaning'
          },
          'location': {
            'specifics': {
              'Terminal': 'terminal 3',
              'Gate': 'gate 1'
            },
            'gps': {
              'latitude': 51.51998,
              'longitude': -0.1237
            }
          },
          'problemType': {
            'server_id': 'i11',
            'title': 'Ice Cream Spill'
          }
        },
      ],
      'assigned': [],
    }
  }

  addReport(report) {
    this.reports.pending.push(report)
    this.assignNextReport()
  }

  assignNextReport() {
    console.log('trying to assign next report')
    const report = this.reports.pending[0]
    if (report != undefined) {
      const successful = this.fixersManager.send(report)
      if (successful) {
        this.reports.pending.shift()
        this.reports.assigned.push(report)
        console.log('assigned to a fixer')
      } else {
        console.log('no fixer available')
      }
    } else {
      console.log('no reports to assign')
    }
  }
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
    this.reportsProcessor = new ReportsProcessor(fixersManager)
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
