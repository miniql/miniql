# miniql

A tiny JSON query language inspired by GraphQL

WORK IN PROGRESS

Pronounced "miniquel", similar to "miniscule".

Sound interesting? Please star this repo.

Follow the developer on Twitter for updates: [@ashleydavis75](https://twitter.com/ashleydavis75).

Documentation and examples will come.


## Motivation

GraphQL is awesome, but sometimes the following can be annoying...

- GraphQL is too big and complicated.
- GraphQL introduces a new language into your stack.
- I don't want to define a "schema". 
    - Schemaless is the best way to prototype an MVP when you don't know what the data is yet.
- It's tedious to have to specify everything you want returned.
    - Sometimes you just want everything returned! Especially when you are exploring your data!

## Aims

- To be tiny, yet flexible.
- To easily create queries and implement the backend.
- To have a single query / update point where auth can be implemented.
- To avoid having many separate REST APIs.
- To be able to retreive aggregate and optimized data to the front end.
- To be able to easily explore your data.

## Features

- Follows relationships and resolved nested entities.
- There is no schema, must like MongoDB.
- The "query" is passed through to the resolver, so in your resolvers you are free to implement:
    - pagination
    - total entities
    - entity search and filtering
    - included fields
    - excluded fields
    - or anthing else you can think of!
- You control how data is returned, e.g.
    - Blacklisted fields
    - Whitelisted fields
    - All data, partial data, whatever you want!


## TODO

- Caching and aggregation (wishlist)
- Authentication / authorization.
- Updates and mutations.
    "type": "update",
        This is very close! But not tested.
- Renames / aliases (this is done, but just for looku ps).
- Hooks - be notifed when particular entities/fields have been updated.
- Do relationships between a separate table.
