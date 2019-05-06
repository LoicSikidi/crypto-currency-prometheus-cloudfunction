# Serverless fonction (GCP CloudFunction)

La fonction consulte CoinApi pour avoir la valeur de plusieurs crypto-monnaies pour ensuite les convertir en mectric `prometheus`.

Listes des crypto-monnaies à aller poller:
* BTC:  Bitcoin
* ETH:  Ethereum

## Estimation de charge/par jour: 96 (24 * 2 * 2)

*Détail du calcul*

```text
24 * 2 : car 2 appels par heures
_  * 2 : 2 crypto-currencies
```

Remarque: CoinApi donne accès à 100 requêtes par jour (compte gratuit).

Exemple du retour de l'API
```json
{
    "time": "2019-05-02T18:10:46.0203778Z",
    "asset_id_base": "BTC",
    "asset_id_quote": "EUR",
    "rate": 4856.1395024686558341415661048
}
```

## Setup du projet en local

Mettre à jour les fichiers:
* .env.yaml (afin de mettre l'API_KEY de CoinApi)
* prometheus.yml (remplacer ${PROJECT} par votre projet GCP) 

```cmd
gcloud functions deploy metrics \
--source=. \
--trigger-http \
--region=europe-west1 \
--runtime=nodejs10 \
--env-vars-file .env.yaml \
--entry-point=metrics

docker run \
-d \
-p 9090:9090 \
--name prometheus \
-v $PWD/prometheus.yml:/etc/prometheus/prometheus.yml \
prom/prometheus

docker run \
-d \
-p 3000:3000 \
--name grafana \
grafana/grafana
```

*tester la cloudfunction*
```cmd
curl --silent --request GET https://europe-west1-${PROJECT}.cloudfunctions.net/metrics
```

*clean le projet*
```cmd
gcloud functions delete metrics --region europe-west1
docker kill prometheus grafana
```

