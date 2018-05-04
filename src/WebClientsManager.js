class WebClientsManager {
  constructor(socketIO) {
    this.socketIO =
      socketIO.of('/webClientSocketIO')
    this.addSocketIOEvents()
  }

  setReportsProcessorTo(reportsProcessor) {
    this.reportsProcessor = reportsProcessor
  }

  addSocketIOEvents() {
    this.addSocketIOConnectEvent()
  }

  addSocketEventsOn(socket) {

  }

  addSocketIOConnectEvent() {
    this.socketIO.on('connection', socket => {
      console.log('a web client connected')
      this.addSocketEventsOn(socket)
      this.send_allReports(socket)
    })
  }

  send_allReports(socket) {
    socket.emit('allReports', this.reportsProcessor.reports)
  }

  send_newReport(report) {
    this.socketIO.emit('newReport', report)
  }
}

module.exports = {
  WebClientsManager: WebClientsManager,
}
