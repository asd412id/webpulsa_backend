class Status {
  statusMessage(message = null, code = 200) {
    return {
      code: code,
      message: message
    }
  }
  statusData(data = null, code = 200) {
    return {
      code: code,
      data: data
    }
  }
}

module.exports = new Status;