# miniql

Small and simple JSON query language inspired by GraphQL

WORK IN PROGRESS

This is a GraphQL-like query language based on JSON.

Intended to me minimal and simple.

Sound interesting? Please star this repo.

Follow the developer on Twitter for updates: [@ashleydavis75](https://twitter.com/ashleydavis75).


## Motivation

- GraphQL is too big.
- GraphQL introduces a new language into your stack.
- I don't want to define full "schema".
- It's tedious to have to specify everything you want returned.

## Aims

- To be tiny.
- To easily create queries and implement the backend.


## Features

- Minimal schema is required - schema is optional to make relationships work.
- If no specifc fields are requests for an entity, all fields are returned.
- "Query" is passed through to the resolver. 
    - You can implement your own pagination and entity search using this.
    - You can also implement restricted fields.


## TODO

- Authentication / authorization.
- Updates and mutations.