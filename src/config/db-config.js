module.exports = {
  opts: {
    url: `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@ds011482.mlab.com:11482/price-scrapper`,
    settings: {
      db: {
        native_parser: false
      }
    }
  }
}
