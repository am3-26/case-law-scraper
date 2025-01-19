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

# Key decisions & future considerations

- In production the DB configuration should be coming from a Config System, or ideally as an env variable.
- Using '--no-sandbox' flag with puppeteer is unsecure (as illustrated in this [nice comic by Google Chrome team](https://www.google.com/googlebooks/chrome/med_26.html)) and is only a workaround to make it work in the Docker image without granting it [SYS_ADMIN privileges](https://github.com/puppeteer/puppeteer/tree/main/docker#running-the-image). For production, a more secure option should be considered.
- Future consideration: the `scrape()` endpoint should store rulings as they appear on the page - currently, however, it tries to load all the rulings before going through the content and storing the rulings.
- The `scrape()` endpoint actually returns _all_ of the rulings stored in the DB, not just the ones that got scraped by the query. It could be considered best of two worlds (web scraper initiator & findAll() endpoint 😎) Of course, in production the `scrape()` endpoint should return all the cases that just got scraped, and `getRulings()` should be a separate endpoint.
- In production DB migrations should be used instead of `synchronize: true` to create schema tables.
- In production (it is also mentioned in the document) `getRulings()` (or such) endpoint should support filtering & sorting
- Ruling's URL was chosen as a primary key, since one ruling can have several case IDs. Instead of using the URL, it would also be perfectly okay to autogenerate UUID's as primary id, and just check the DB by case id / url for existing rulings before storing a newly scraped one - however, I considered it to be a bit messy.
- If some data cannot be found on the page (case id(s), date, area of law), the case gets skipped with the error logged. In production some fields can probably be set to nullable and the case can still be stored, as long as the ruling's full text has been scraped.
- While using the [MFKN website](https://mfkn.naevneneshus.dk), I realised that even when passing the `sort=desc` query parameter, the sorting would sometimes not be applied on the website... That's why there is extra logic to manually click the sorting button when on the page.
- There should be tests!
