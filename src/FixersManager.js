const Location = require('./Location.js').Location

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

module.exports = {
  FixersManager: FixersManager,
}
