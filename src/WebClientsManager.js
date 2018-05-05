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
    const reports = this.reportsProcessor.reports
    socket.emit('allReports', reports)
  }

  send_newReport(report) {
    this.socketIO.emit('newReport', report)
  }

  send_reportAssigned(reportID) {
    this.socketIO.emit('reportAssigned', reportID)
  }
}

module.exports = {
  WebClientsManager: WebClientsManager,
}
