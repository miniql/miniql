import { t } from "typy";
import { networkInterfaces } from "os";

//
// Represents a nested/related entity to be resovled.
//
export interface INestedEntityResolve {
    //
    // Each nested entity is just another entity query.
    //
    [entityTypeName: string]: IEntityQuery;
}

//
// Represents a query for a particular entity type.
//
export interface IEntityQuery {
    //
    // Specifies the type of entity that is being queried for.
    // If this is omitted the entity type defaults to the query key.
    //
    from?: string;

    //
    // Arguments to pass to the query resolver (the MiniQL backend).
    //
    args?: any;

    //
    // Instructions on what nested/related entities should be resolved.
    //
    resolve?: INestedEntityResolve;
}

//
// Represents a particular query operation (eg query or update).
//
export interface IQueryOperation {
    //
    // Sub-queries for each entity.
    //
    [queryKey: string]: IEntityQuery;
}

//
// Represents a root level query.
//
export interface IQuery {
    //
    // Sub-queries for each type of operation.
    //
    [operationName: string]: IQueryOperation;
};

//
// Represents a resolver for a nested entity.
//
export interface INestedEntityResolver {
    //
    // User-defined function that can get retreive a set of entities related to the parent entity.
    //
    invoke: (parent: any, args: any, context: any) => Promise<any>;
}

//
// Represents a set of resolvers for nested entities.
//
export interface INestedEntityResolvers {
    //
    // Each nested entity requires a resolver to retrieve entities from the parent entity.
    //
    [entityTypeName: string]: INestedEntityResolver;
}

//
// Represents a resolver for this type of entity.
//
export interface IEntityQueryResolver {
    //
    // User-defined function that can get or update an entity or set of entities.
    //
    invoke: (args: any, context: any) => Promise<any>;

    //
    // User-defined nested entity resolvers.
    //
    nested?: INestedEntityResolvers;
}

//
// Represents a query resolver. 
// This is a MiniQL backend.
// An object that finds entities.
//
export interface IQueryOperationResolver {
    //
    // Each entity requires a resolver to retrieve or update the entities of this type.
    //
    [entityTypeName: string]: IEntityQueryResolver;
};

//
// Represents a query resolver.
//
export interface IQueryResolver {
    // 
    // Each query can choose its type of operation (eg get or update).
    //
    [operationName: string]: IQueryOperationResolver;
}

//
// Execute a query.
//
export async function miniql<T = any>(rootQuery: IQuery, rootResolver: IQueryResolver, context: any): Promise<T> {

    const output: any = {};

    const opNames = Object.keys(rootQuery); //todo: if more than 1 opName maybe nest output under opname?
    if (opNames.length <= 0) {
        throw new Error(`Query doesn't contain any operations.`);
    }

    for (const opName of opNames) {
        const operationQuery = rootQuery[opName];
        if (!operationQuery) {
            throw new Error(`Query operation "${opName}" is missing from query.`);
        }

        if (!t(operationQuery).isObject) {
            throw new Error(`Expected query resolver for "${opName}" to be an object.`);
        }

        const operationResolver = rootResolver[opName];
        if (!operationResolver) {
            throw new Error(createMissingQueryOperationErrorMessage(opName));
        }

        if (!t(operationResolver).isObject) {
            throw new Error(`Expected query resolver for "${opName}" to be an object.`);
        }

        for (const entityTypeName of Object.keys(operationQuery)) {
            const entityQuery = operationQuery[entityTypeName];
            if (!entityQuery) {
                throw new Error(`Entity query "${entityTypeName}" is missing under operation "${opName}".`);
            }
            if (!t(entityQuery).isObject) {
                throw new Error(`Expected entity query "${entityTypeName}" under operation "${opName}" to be an object.`);
            }
            await resolveEntity(entityQuery, output, entityTypeName, { operationResolver, opName, context });
        }
    }
    
    return output;
}

//
//  Container for globals passed recursively through the query process.
//
interface IQueryGlobals {
    //
    // The root resolver for the current query option.
    //
    operationResolver: IQueryOperationResolver;
    
    //
    // Name of the query operation being invoked.
    //
    opName: string;
    
    //
    // Global user-defined context for the query.
    //
    context: any;
}

//
// Resolves a root entity.
//
async function resolveEntity(entityQuery: IEntityQuery, output: any, entityTypeName: string, queryGlobals: IQueryGlobals) {
    
    const entityResolverName = entityQuery.from !== undefined ? entityQuery.from : entityTypeName;
    const entityResolver = queryGlobals.operationResolver[entityResolverName];
    if (!entityResolver) {
        throw new Error(createMissingResolverErrorMessage(queryGlobals.opName, entityTypeName, entityTypeName));
    }

    if (!entityResolver.invoke) {
        throw new Error(`Entity resolver "${entityTypeName}" is missing an "invoke" function.`);
    }

    if (!t(entityResolver.invoke).isFunction) {
        throw new Error(`Expected "invoke" function for entity resolver "${entityTypeName}" is to be a function.`);
    }

    //
    // Resolve this entity.
    //
    const resolvedEntity = await entityResolver.invoke(entityQuery.args || {}, queryGlobals.context); //TODO: Do these in parallel.

    //
    // Plug the resolved entity into the query result.
    //
    output[entityTypeName] = resolvedEntity;

    //
    // Resolve nested entities.
    //
    await resolveNestedEntities(entityQuery, resolvedEntity, entityResolverName, queryGlobals);
}

//
// Resolve nested entities for an entity.
//
async function resolveNestedEntities(entityQuery: IEntityQuery, parentEntity: any, parentEntityResolverName: string, queryGlobals: IQueryGlobals) {
    if (entityQuery.resolve) {
        //
        // Resolve nested entities.
        //
        for (const nestedEntityTypeName of Object.keys(entityQuery.resolve)) {
            const nestedEntityQuery = entityQuery.resolve[nestedEntityTypeName];
            if (!t(nestedEntityQuery).isObject) {
                throw new Error(`Unsupported type for "resolve" field: ${typeof (nestedEntityQuery)}.`);
            }
            if (t(parentEntity).isArray) {
                await Promise.all(parentEntity.map((singleEntity: any) => {
                    return resolveNestedEntity(nestedEntityQuery, singleEntity, parentEntityResolverName, nestedEntityTypeName, queryGlobals);
                }));
            }
            else {
                await resolveNestedEntity(nestedEntityQuery, parentEntity, parentEntityResolverName, nestedEntityTypeName, queryGlobals);
            }
        }
    }
}

//
// Resolves a nested entity.
//
async function resolveNestedEntity(nestedEntityQuery: IEntityQuery, parentEntity: any, parentEntityResolverName: string, nestedEntityTypeName: string, queryGlobals: IQueryGlobals): Promise<void> {
    
    const parentEntityResolver = queryGlobals.operationResolver[parentEntityResolverName]; //todo: error check that it exists!
    const nestedEntityResolverName = nestedEntityQuery.from !== undefined ? nestedEntityQuery.from : nestedEntityTypeName;
    if (!parentEntityResolver.nested) {
        throw new Error(`Failed to find nested resolvers for operation "${queryGlobals.opName}" for nested entity "${nestedEntityResolverName}" under "${parentEntityResolverName}".`); //TODO: flesh out this error msg.
    }

    const nestedEntityResolver = parentEntityResolver.nested[nestedEntityResolverName];
    if (nestedEntityResolver === undefined) {
        throw new Error(`Failed to find resolver for operation "${queryGlobals.opName}" for nested entity "${nestedEntityResolverName}" under "${parentEntityResolverName}" outputting to "${nestedEntityQuery}".`); //TODO: flesh out this error msg.
    }

    //
    // Resolve this entity.
    //
    const resolvedEntity = await nestedEntityResolver.invoke(parentEntity, nestedEntityQuery.args || {}, queryGlobals.context); //TODO: Do these in parallel. TODO: error check that invoke fn exists.

    //
    // Plug the resolved entity into the query result.
    //
    parentEntity[nestedEntityTypeName] = resolvedEntity;

    //
    // Resolve nested entities.
    //
    await resolveNestedEntities(nestedEntityQuery, resolvedEntity, nestedEntityResolverName, queryGlobals);
}


//
// Creates an error message for a missing query operation.
//
function createMissingQueryOperationErrorMessage(opName: string): string | undefined {
    return `
Query operation "${opName}" is not supported by the resolver.
You must define a query resolver that looks like this:
    const root = {
        ${opName}: {
            // ... Entity query resolvers go here.
        },

        // ... Other query operations go here.
    };
`;
}

//
// Creates an error message for a missing resolver.
//
function createMissingResolverErrorMessage(opName: any, entityTypeName: any, queryKey: string): string {
    return `
Failed to find resolver for operation "${opName}" for entity "${entityTypeName}" outputting to "${queryKey}".\n
You must define a query resolver that looks like this:
    const root = {
        ${opName}: {
            ${entityTypeName}: async function (args, context) => {
                if (args.something) {
                    // ... Return a single entity that matches 'something'.
                }
                else {
                    // ... Return the set of entities (you probably want to use pagination).
                }
            },

            // ... Other resolvers go here.
        },

        // ... Other query operations go here.
    };
`;
}