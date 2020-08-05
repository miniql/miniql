import { t } from "typy";

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
    // The name of the global entity resolver to invoke to get the entity.
    // If this is omitted the entity resolver name defaults to the entity name.
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
    // The name of the global entity resolver for this nested entity relates to (if any).
    // When this omitted the nested entity name is used as the name of the global entity resolver.
    // 
    from?: string;

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
// Logs a verbose message.
//
function verbose(verbose: boolean, nestingLevel: number, msg: any) {
    if (verbose) {
        console.log(" ".repeat(nestingLevel*4) + msg);
    }
}

//
// Executes a query.
//
export async function miniql<T = any>(rootQuery: IQuery, rootResolver: IQueryResolver, context: any): Promise<T> {

    const output: any = {};

    const opNames = Object.keys(rootQuery); //todo: if more than 1 opName maybe nest output under opname?
    if (opNames.length <= 0) {
        throw new Error(`Query doesn't contain any operations.`);
    }
    
    verbose(context.verbose, 0, `** Executing query.`);

    for (const opName of opNames) {
        verbose(context.verbose, 1, `= Invoking query operation "${opName}".`);

        const queryOperation = getQueryOperation(rootQuery, opName);
        const operationResolver = getOperationResolver(rootResolver, opName);

        for (const entityTypeName of Object.keys(queryOperation)) {
            await resolveRootEntity(queryOperation, output, entityTypeName, { operationResolver, opName, context }, 2);
        }
    }
    
    return output;
}

//
// Gets an operation resolver from a query with error checkign.
//
function getOperationResolver(rootResolver: IQueryResolver, opName: string) {
    const operationResolver = rootResolver[opName];
    if (!operationResolver) {
        throw new Error(createErrorForMissingQueryOperation(opName));
    }

    if (!t(operationResolver).isObject) {
        throw new Error(`Expected query resolver for "${opName}" to be an object.`);
    }
    return operationResolver;
}

//
// Gets query operation from a query with some error checking.
//
function getQueryOperation(rootQuery: IQuery, opName: string) {
    const queryOperation = rootQuery[opName];
    if (!queryOperation) {
        throw new Error(`Query operation "${opName}" is missing from query.`);
    }

    if (!t(queryOperation).isObject) {
        throw new Error(`Expected query resolver for "${opName}" to be an object.`);
    }
    return queryOperation;
}

//
// Resolves a root entity.
//
async function resolveRootEntity(queryOperation: IQueryOperation, output: any, entityTypeName: string, queryGlobals: IQueryGlobals, nestingLevel: number) {

    verbose(queryGlobals.context.verbose, nestingLevel, `= Resolving root entity "${entityTypeName}".`);
    
    const entityQuery = queryOperation[entityTypeName];
    if (!entityQuery) {
        throw new Error(`Entity query "${entityTypeName}" is missing under operation "${queryGlobals.opName}".`);
    }
    if (!t(entityQuery).isObject) {
        throw new Error(`Expected entity query "${entityTypeName}" under operation "${queryGlobals.opName}" to be an object.`);
    }

    const entityResolverName = entityQuery.from !== undefined ? entityQuery.from : entityTypeName;
    const entityResolver = getGlobalEntityResolver(queryGlobals, entityResolverName, entityTypeName, "query result", nestingLevel+1);

    //
    // Resolve this entity.
    //
    const resolvedEntity = await entityResolver.invoke(entityQuery.args || {}, queryGlobals.context); //TODO: Do these in parallel.

    const isArray = t(resolvedEntity).isArray;
    if (isArray) {
        verbose(queryGlobals.context.verbose, nestingLevel+1, `Resolved an array of entities.`);
    }
    else {
        verbose(queryGlobals.context.verbose, nestingLevel+1, `Resolved a single entity.`);
    }

    const clonedEntity = isArray // Clone entity so it can be modified.
        ? resolvedEntity.map((singleEntity: any) => Object.assign({}, singleEntity))
        : Object.assign({}, resolvedEntity); 

    //
    // Plug the resolved entity into the query result.
    //
    output[entityTypeName] = clonedEntity;

    //
    // Resolve nested entities.
    //
    await resolveNestedEntities(entityQuery, clonedEntity, entityResolverName, entityTypeName, queryGlobals, nestingLevel+2);
}

//
// Gets the resolver for a particular entity type.
//
function getGlobalEntityResolver(queryGlobals: IQueryGlobals, entityResolverName: string, entityTypeName: string, outputLocation: string, nestingLevel: number): IEntityQueryResolver {

    verbose(queryGlobals.context.verbose, nestingLevel, `Getting global entity resolver "${entityResolverName}" to resolve entity type "${entityTypeName}".`);

    const entityResolver = queryGlobals.operationResolver[entityResolverName];
    if (!entityResolver) {
        throw new Error(createErrorForMissingGlobalResolver(queryGlobals.opName, entityResolverName, entityTypeName, outputLocation));
    }

    if (!entityResolver.invoke) {
        throw new Error(createErrorForMissingInvoke(queryGlobals.opName, entityResolverName, entityTypeName, outputLocation));
    }

    if (!t(entityResolver.invoke).isFunction) {
        throw new Error(createErrorForInvokeNotAFn(queryGlobals.opName, entityResolverName, entityTypeName, outputLocation));
    }
    return entityResolver;
}

//
// Resolve nested entities for an entity.
//
async function resolveNestedEntities(entityQuery: IEntityQuery, parentEntity: any, parentEntityGlobalResolverName: string, parentEntityTypeName: string, queryGlobals: IQueryGlobals, nestingLevel: number) {
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
                    return resolveNestedEntity(nestedEntityQuery, singleEntity, parentEntityGlobalResolverName, parentEntityTypeName, nestedEntityTypeName, queryGlobals, nestingLevel);
                }));
            }
            else {
                await resolveNestedEntity(nestedEntityQuery, parentEntity, parentEntityGlobalResolverName, parentEntityTypeName, nestedEntityTypeName, queryGlobals, nestingLevel);
            }
        }
    }
}

//
// Resolves a nested entity.
//
async function resolveNestedEntity(nestedEntityQuery: IEntityQuery, parentEntity: any, parentEntityGlobalResolverName: string, parentEntityTypeName: string, nestedEntityTypeName: string, queryGlobals: IQueryGlobals, nestingLevel: number): Promise<void> {

    verbose(queryGlobals.context.verbose, nestingLevel, `= Resolving nested entity "${nestedEntityTypeName}".`);

    //
    // Get the global resolver for the parent entity.
    //
    const parentEntityResolver = getGlobalEntityResolver(queryGlobals, parentEntityGlobalResolverName, parentEntityTypeName, `parent entity "${parentEntityTypeName}"`, nestingLevel + 1);

    const nestedEntityLocalResolverName = nestedEntityQuery.from !== undefined ? nestedEntityQuery.from : nestedEntityTypeName;
    if (!parentEntityResolver.nested) {
        throw new Error(`Failed to find nested resolvers for operation "${queryGlobals.opName}" for nested entity "${nestedEntityLocalResolverName}" under "${parentEntityGlobalResolverName}".`); //TODO: flesh out this error msg.
    }

    const nestedEntityResolver = parentEntityResolver.nested[nestedEntityLocalResolverName];
    if (nestedEntityResolver === undefined) {
        throw new Error(`Failed to find nested resolver for operation "${queryGlobals.opName}" for nested entity "${nestedEntityLocalResolverName}" under "${parentEntityGlobalResolverName}".`); //TODO: flesh out this error msg.
    }

    //
    // Resolve this entity.
    //
    const resolvedEntity = await nestedEntityResolver.invoke(parentEntity, nestedEntityQuery.args || {}, queryGlobals.context); //TODO: Do these in parallel.
    const clonedEntity = t(resolvedEntity).isArray // Clone entity so it can be modified.
        ? resolvedEntity.map((singleEntity: any) => Object.assign({}, singleEntity))
        : Object.assign({}, resolvedEntity); 

    //
    // Plug the resolved entity into the query result.
    //
    parentEntity[nestedEntityTypeName] = clonedEntity;

    //
    // Find the global name of the local entity resolver.
    //
    const nestedEntityGlobalResolverName = nestedEntityResolver.from || nestedEntityLocalResolverName;

    //
    // Resolve nested entities.
    //
    await resolveNestedEntities(nestedEntityQuery, clonedEntity, nestedEntityGlobalResolverName, nestedEntityTypeName, queryGlobals, nestingLevel+2);
}


//
// Creates an error message for a missing query operation.
//
function createErrorForMissingQueryOperation(opName: string): string {
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
// Creates an error message for a missing global resolver.
//
function createErrorForMissingGlobalResolver(opName: string, entityResolverName: string, entityTypeName: string, outputLocation: string): string {
    return `
Failed to find global resolver for entity "${entityResolverName}" of operation "${opName}", outputting to "${entityTypeName}" in ${outputLocation}.\n
You must define a query resolver that looks like this:\n` +
    createResolverExample(opName, entityResolverName);
}

//
// Creates an error message for a missing invoke function.
//
function createErrorForMissingInvoke(opName: string, entityResolverName: string, entityTypeName: string, outputLocation: string): string {
    return `
Failed to find invoke function for entity "${entityResolverName}" of operation "${opName}", outputting to "${entityTypeName}" in ${outputLocation}.\n
You must define a query resolver that looks like this:\n` + 
    createResolverExample(opName, entityResolverName);
}

//
// Creates an error message for when the supplied "invoke" function is not a function.
//
function createErrorForInvokeNotAFn(opName: string, entityResolverName: string, entityTypeName: string, outputLocation: string): string {
    return `
Expected "invoke" function for entity resolver "${entityTypeName}" is to be a function.
You must define a query resolver that looks like this:\n` + 
    createResolverExample(opName, entityResolverName);
}


//
// Create an example query resolver.
//
function createResolverExample(opName: string, entityResolverName: string) {
    return `
    const root = {
        ${opName}: {
            ${entityResolverName}: {
                invoke: async function (args, context) => {
                    if (args.something) {
                        // ... Return or update a single entity that matches 'something'.
                    }
                    else {
                        // ... Return the set of entities (you probably want to use pagination).
                        // ... Or insert an entity.
                    }
                },
            },

            // ... Other resolvers go here.
        },

        // ... Other query operations go here.
    };
`;
}

