# Setup

You can start the application by running: 

```shell
docker compose up
```

> If you're on an ARM-based CPU, you might need to use the `DOCKER_DEFAULT_PLATFORM=linux/amd64` argument when you build the Docker images.
(If you're on Apple Silicon, it might also be needed to turn Rosetta support on for x86_64/amd64 emulation in your Docker Desktop).
> 
> ```DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose up```

That will build NestJS application and Postgres DB Docker images.

The NestJS application will be available at http://localhost:3000, while the Postgres DB will be open for connections on port 5432.

You can also now access the in-browser GraphQL IDE at http://localhost:3000/graphql.

# Schemas

This application is built for serving case rulings of the Danish Environmental and Food Complaints Board (Miljø- og Fødevareklagenævnet).

The model is as follows:
```typescript
export class Case {
  url: string; // primary key; the url where the ruling can be found
  caseIds: string[]; // one or multiple case id(s) associated with the ruling
  date: Date; // date of the ruling
  areaOfLaw: string; // case jurisdiction
  ruling: string; // full text of the documented case ruling
}
```

# GraphQL API

The GraphQL API can be queried by POST requests to http://localhost:3000/graphql, or by using the GraphQL IDE.

## Scrape case rulings
The scrape query fetches information from a set number of pages and stores the rulings in the database.
The query returns all of the scraped legal cases, which can include their URLs, case IDs, dates, jurisdiction, and rulings.

GraphQL IDE:
```
{
  scrape(pages:1) {
    url,
    caseIds,
    date,
    areaOfLaw,
    ruling
  }
}
```
Post request (curl):

```shell
curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"{scrape(pages:1) {url,caseIds,date,areaOfLaw,ruling}}"}' --compressed
```

## Get rulings by case ID
The query fetches information about a specific ruling by its case ID. 
In case there have been a history of several rulings for the same case, multiple rulings will be returned.

GraphQL IDE:
```
{
  getRulingsByCaseId(id:"00/00000") {
    url,
    caseIds,
    date,
    areaOfLaw,
    ruling
  }
}
```
Post request (curl):

```shell
curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"{getRulingsByCaseId(id:\"23/12751\") {url,caseIds,date,areaOfLaw,ruling}}"}' --compressed
```

# Key decisions and any notable trade-offs.

# Anything you’d change or add to make the solution production-ready (e.g., tests, security enhancements).
