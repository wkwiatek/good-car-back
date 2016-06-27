module.exports = {
  opts: {
    url: `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@ds011442.mlab.com:11442/good-car`,
    settings: {
      db: {
        native_parser: false
      }
    }
  }
}
