const client = require("prom-client");
const Registry = client.Registry;
const register = new Registry();

const rp = require('request-promise');

const 
  config = {
    currencies: [
      "BTC",
      "ETH"
    ]
  },
  gauge = new client.Gauge({
    name: "crypto_currency_gauge",
    help: "Crypto currency variable measurements gauge",
    labelNames:["crypto", "variable"],
    registers: [register],
  })

const
  createMetrics = (v) => {
    gauge.labels(v.asset_id_base, "rate").set(v.rate, Date.now());
    return(v.rate);
  },
  getCryptoCurrenciesRate = (apiKey, cryptoCurrencies, currency = 'EUR') => {
    return Promise.all(cryptoCurrencies
        .map(cryptoCurrency => {
            const options = {
                uri: `https://rest.coinapi.io/v1/exchangerate/${cryptoCurrency}/${currency}`,
                headers: {
                    'X-CoinAPI-Key': apiKey
                },
                json: true
            }
            return rp(options);
        })
        // Avoids Promise.all failing on a single reject
        .map(p => p.catch(() => undefined))
    )
  }


exports.metrics = async (req, res) => {
    try {
        const apiKey = process.env.APIKEY || null;
        const cryptoCurrenciesRate = await getCryptoCurrenciesRate(apiKey, config.currencies);
        cryptoCurrenciesRate.map(cryptoCurrenciesRate => createMetrics(cryptoCurrenciesRate));
        return res.status(200).send(register.metrics());
    } catch (err) {
        return res.status(500).send(err);
    }
}