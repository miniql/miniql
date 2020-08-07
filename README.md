# miniql

A tiny JSON-based query language inspired by GraphQL

WORK IN PROGRESS

Pronounced "miniquel", similar to "miniscule".

Love this? Please star this repo!

Follow the developer on Twitter for updates: [@ashleydavis75](https://twitter.com/ashleydavis75).

Documentation and more examples will come soon.

# Examples

## Interactive example

There's an interactive browser-only example of MiniQL here:

https://miniql.github.io/miniql-interactive-example/

You fnd find the code for it here:

https://github.com/miniql/miniql-interactive-example
    
## Node.js + CSV files

Here is an example of making MiniQL queries against a CSV file dataset under Node.js:

https://github.com/miniql/miniql-csv-example

## Node.js + JSON files

Here is an example of making MiniQL queries against a JSON file dataset under Node.js:

https://github.com/miniql/miniql-json-example


## JavaScript notebook

Here is an easy to read MiniQL example in a JavaScript notebook

https://miniql.github.io/notebook-example/

## Express + MongoDB

Here is an example of using MiniQL to make queries against a MongoDB database through an Express REST API to display query results in the frontend.

https://github.com/miniql/miniql-express-mongodb-example

# Motivation

GraphQL is awesome, but sometimes the following can be annoying...

- GraphQL is too big and complicated.
- GraphQL introduces a new language into your stack.
- I don't want to define a "schema". 
    - Schemaless is the best way to prototype an MVP when you don't know what the data is yet.
- It's tedious to have to specify everything you want returned.
    - Sometimes you just want everything returned! Especially when you are exploring your data!

# Aims

- To be tiny, yet flexible.
- To easily create queries.
- To easily implement the backend.
- To have a single query end point where auth can be implemented.
- To avoid having many separate REST APIs.
- To be able to retreive aggregate and optimized data to the front end.
- To be able to easily explore your data.
- To not impose unecessary structure or rules on your data!
- Make the most of the backend capabilities (eg search and filtering capability in MongoDB).

# Features

- Decouples the query engine from entity resolution.
- There is no enforced schema, just like MongoDB. But you can make your own using [JSON schema](https://json-schema.org/).
- There is no built-in type system - use your programming language for that! (e.g. TypeScript)
- The query language is JSON and can easily be sent over the weire.
- The results are JSON and can easiy be received over the wire.
- Follows relationships and resolves nested entities.
    - You control how the relationships in your data are defined.
- Aggregate query results from different data sources.
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
- Optionally alias entities in the output. You control the field names that returned in the query result.
- It works in both Node.js and the browser.

# Future

- Data versioning.
- Add a configurable MongoDB resolver.
- Add a configurable JSON file resolver.
- Caching and aggregation (wishlist)
- Authentication / authorization.
- Hooks - be notifed when particular entities/fields have been updated.
- Reverse relationships. Get director entity and lookup all their movies.
- Optimisation to do queries in parallel.
- Built-in filtering?
- How to retreieve a count after search/filtering is applied.

# Wishlist

- Parallelise complex queries over multiple nodes.

Don't forget to star this repo and [follow the developer on Twitter](https://twitter.com/ashleydavis75).