# miniql

A tiny JSON-based query language inspired by GraphQL

Pronounced "miniquel", similar to "miniscule".

Love this? Please star [this repo!](https://github.com/miniql/miniql)

Follow the developer on Twitter for updates: [@ashleydavis75](https://twitter.com/ashleydavis75).

Documentation and more examples will come soon.

New to this? Check out the examples below or jump to [getting started](#getting-started).

For a quick idea of what queries look like and how they work, jump straight into [the interactive example](https://miniql.github.io/miniql-interactive-example/).

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

## Frontend + Express REST API + MongoDB

Here is an example of using MiniQL to make queries against a MongoDB database through an Express REST API to display query results in the frontend.

https://github.com/miniql/miniql-express-mongodb-example

# Motivation

GraphQL is awesome, but sometimes the following can be annoying...

- It is big and complicated.
- It introduces a new language into your stack.
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
- To be able to easily explore data.
- To not impose unecessary structure or rules on your data!
- Make the most of the backend capabilities (eg search and filtering capability in the database)

# Features

- The query language is JSON and can easily be sent over the weire.
- The results are JSON and can easiy be received over the wire.
- MiniQL works in both Node.js and the browser.
    - MiniQL can potentially work in other programming languages, if someone wants to create an implementation for their own fav language.
- Decouples the query engine from entity resolution ([separation of concerns](https://
- There is no enforced schema, just like MongoDB. 
    - But you can easily make your own [JSON schema](https://json-schema.org/) for validation and intellisense in the frontend.
en.wikipedia.org/wiki/Separation_of_concerns)).
- There is no built-in type system - use your programming language for that! (e.g. TypeScript)
- Follows relationships and resolves nested entities.
    - You control how the relationships in your data are defined.
- Aggregates query results from different data sources.
- Supports arbitrary user-defined types of operations:
    - The MiniQL convertion is have "get" or "update" operations.
    - But use whatever names you like.
    - You can have any other operations as well with whatever names you like.
- Optionally alias entities in the output. You control the field names that returned in the query result.
- The "query" is passed through to the resolver, you can build your own resolver or use one of the existing plugins:
    - [JSON files](https://www.npmjs.com/package/@miniql/json)
    - [CSV files](https://www.npmjs.com/package/@miniql/csv)
    - [Inline data](https://www.npmjs.com/package/@miniql/inline)

# Bring your own

MiniQL delegates queries for entities to the *query resolver*.

The query resolver is something that you implmenent or is provided by a MiniQL plugin (such as the [JSON plugin](https://www.npmjs.com/package/@miniql/json), the [CSV plugin](https://www.npmjs.com/package/@miniql/csv) or the [Inline data plugin](https://www.npmjs.com/package/@miniql/inline)).

Implementing your own resolver means you can have what ever features you like in the backend.

Adding features like these is completely under your control:

- Pagination
- Retrieving total entities
- Entity search and filtering
- Included fields
- Excluded fields
- Or anthing else you can think of!

You can manage how data is returned, e.g:

- Blacklisted fields
- Whitelisted fields
- All data, partial data, whatever you want!

# Future

- Add a configurable MongoDB resolver.
- Caching and aggregation (wishlist)
- Hooks - be notifed when particular entities/fields have been updated.
- Optimisation to do queries in parallel.
- Built-in filtering?
- How to retreieve a count after search/filtering is applied.

# Getting started

Install MiniQL:

```bash
npm install --save miniql
```

Import MiniQL (JavaScript):


```javascript
const { miniql } = require("miniql");
```

Import MiniQL (TypeScript):

```typescript
import { miniql } from "miniql";
```

Now we must create a query resolver. For this example we'll use a `character` entity (see the Star Wars data in [the interactive example](https://miniql.github.io/miniql-interactive-example/)).

We need to define functions for retrieving and updating our character entity:

```javascript
const queryResolver = {
    get: {
        character: {
            invoke: async (args: any, context: any) => { // Handles a 'get' query.
                if (args.name !== undefined) {
                    // Asking for a particular named character.
                    // Look up the single named character in your database and return it.
                    const theCharacter = ...;
                    return theCharacter;
                }
                else {
                    // Asking for all characters.
                    // Look up all characters in your database and return them.
                    const allCharacters = ...;
                    return allCharacters;
                }
            }
        }
    },

    update: {
        character: {
            invoke: async (args: any, context: any) => { // Handles an 'update' query.
                if (args.name !== undefined) {
                    const updateParams = args.params;
                    // Store `updateParams` against the single 
                    // named character in your database.
                }
                else {
                    const updateParams = args.params;
                    // Add a new named character with 
                    // `updateParams` in your database.
                }
            },
        },
    },
};
```

There's various plugins that can create a query resolver for us depending on our data source:
- [JSON files](https://www.npmjs.com/package/@miniql/json)
- [CSV files](https://www.npmjs.com/package/@miniql/csv)
- [Inline data](https://www.npmjs.com/package/@miniql/inline)


A MonogDB query resolver is coming soon! If you'd like to implement a resolver for your own favorite database [please let me know](mailto:ashley@codecapers.com.au).

Now that we have a query resolver we can execute queries against it with MiniQL.

First we need a query, let's create one to get the character called "Darth Vader":

```javascript
const getQuery = {
    get: { // This is a 'get' operation.
        character: {
            args: {
                name: "Darth Vader", // We are retrieving the record for Mr Vader.
            },
        },
    },
};
```

Now we can execute the `get` query to retreive the record for Mr Vader:

```javascript
const context = {}; // Global context passed to our resolver.
const queryResult = await miniql(getQuery, queryResolver, {}); // Executes the query.
console.log(queryResult);
```

Here's the output of the query:

```json
{
    "character": {
        "name": "Darth Vader",
        "height": 202,
        "mass": 136,
        "hair_color": "none",
        "skin_color": "white",
        "eye_color": "yellow",
        "birth_year": "41.9BBY",
        "gender": "male",
        "homeworld": "Tatooine",
        "species": "Human"
    }
}
```

Now let's execute an `update` query to modify mr Vader's record:

```javascript
const updateQuery = {
    update: { // This is an 'update' operation.
        character: {
            args: {
                name: "Darth Vader",
                params: {
                    // Sets Mr Vaders hair color.
                    hair_color: "brown", // At least it was brown back when he had hair.
                },
            },
        },
    },
};
```

Now we execute the `update` query against our query resolver:

```javascript
const context = {};
await miniql(updateQuery, queryResolver, {});
```

Mr Vader's hair color is now set to "brown".

Have fun with MiniQL!

More advanced documentation is coming soon! [Follow for updates.]((https://twitter.com/ashleydavis75))

# Wishlist

- Parallelise complex queries over multiple nodes.

Don't forget to star this repo and [follow the developer on Twitter](https://twitter.com/ashleydavis75).