class ReportsProcessor {
  constructor(delegates) {
    this.delegates = delegates
    this.delegates.fixersManager.setReportsProcessorTo(this)
    this.delegates.webClientsManager.setReportsProcessorTo(this)
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
              'Terminal': 'E',
              'Gate': '1'
            },
            'gps': {
              'latitude': 51.50998,
              'longitude': -0.1337
            }
          },
          'dateSubmitted': '2018-04-28T23:53:17.182+0000',
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
              'Terminal': 'C',
              'Gate': '1'
            },
            'gps': {
              'latitude': 51.51998,
              'longitude': -0.1237
            }
          },
          'dateSubmitted': '2018-04-28T23:53:17.182+0000',
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
    this.delegates.webClientsManager.send_newReport(report)
    this.assignNextReport()
  }

  assignNextReport() {
    console.log('trying to assign next report')
    const pending = this.reports.pending
    const report = pending[0]
    if (report != undefined) {
      const successful = this.delegates.fixersManager.send(report)
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

  aFixerConnected() {
    this.assignNextReport()
  }
}

module.exports = {
  ReportsProcessor: ReportsProcessor,
}
