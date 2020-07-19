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
- To not imposed unececssary structure or rules on your data!

## Features

- Decouples the query engine from entity resolution.
- No type system - use your programming language for that! (e.g. TypeScript)
- Follows relationships and resolves nested entities.
    - You control how the relationships in your data are defined.
- There is no schema, must like MongoDB.
- Different types of operations.
    - The MiniQL convertion is use "query" or "update" operations.
    - But you can use whatever names you like.
    - You can have any other operations as well with whatever names you like.
- The "query" or "update" is passed through to the resolver, so in your resolvers you are free to implement:
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

## Future

- Data versioning.
- Add a configurable MongoDB resolver.
- Add a configurable JSON file resolver.
- Caching and aggregation (wishlist)
- Authentication / authorization.
- Renames / aliases (this is done, but just for lookups).
- Hooks - be notifed when particular entities/fields have been updated.
- Reverse relationships. Get director entity and lookup all their movies.
- Optimisation to do queries in parallel.