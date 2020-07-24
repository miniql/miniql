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
    const operationName = Object.keys(rootQuery)[0]; //TODO: error check! Only one type!
    const operationQuery = rootQuery[operationName];
    const operationResolver = rootResolver[operationName];
    if (!operationResolver) {
        throw new Error(createMissingQueryOperationErrorMessage(operationName));
    }

    for (const entityTypeName of Object.keys(operationQuery)) {
        const entityQuery = operationQuery[entityTypeName]; //TODO: check this is an object!
        await resolveEntity(entityQuery, output, entityTypeName, operationResolver, operationName, context);
    }

    return output;
}

//
// Resolves a root entity.
//
async function resolveEntity(entityQuery: IEntityQuery, output: any, entityTypeName: string, operationResolver: IQueryOperationResolver, operationName: string, context: any) {
    
    const entityResolverName = entityQuery.from !== undefined ? entityQuery.from : entityTypeName; //TODO: check "from is a string"
    const entityResolver = operationResolver[entityResolverName];
    if (!entityResolver) {
        throw new Error(createMissingResolverErrorMessage(operationName, entityTypeName, entityTypeName));
    }

    //
    // Resolve this entity.
    //
    const resolvedEntity = await entityResolver.invoke(entityQuery.args || {}, context); //TODO: Do these in parallel. TODO: error check that invoke fn exists.

    //
    // Plug the resolved entity into the query result.
    //
    output[entityTypeName] = resolvedEntity;

    //
    // Resolve nested entities.
    //
    await resolveNestedEntities(entityQuery, resolvedEntity, entityResolver, operationResolver, context);
}

//
// Resolve nested entities for an entity.
//
async function resolveNestedEntities(entityQuery: IEntityQuery, parentEntity: any, parentEntityResolver: IEntityQueryResolver, operationResolver: IQueryOperationResolver, context: any) {
    if (entityQuery.resolve) {
        //
        // Resolve nested entities.
        //
        for (const nestedEntityTypeName of Object.keys(entityQuery.resolve)) {
            const nestedEntityQuery = entityQuery.resolve[nestedEntityTypeName];
            if (!t(nestedEntityQuery).isObject) {
                throw new Error(`Unsupported type for "resolve" field: ${typeof (nestedEntityQuery)}.`); //todo: is this tested?
            }
            if (t(parentEntity).isArray) {
                await Promise.all(parentEntity.map((singleEntity: any) => {
                    return resolveNestedEntity(nestedEntityQuery, singleEntity, nestedEntityTypeName, parentEntityResolver, operationResolver, context);
                }));
            }
            else {
                await resolveNestedEntity(nestedEntityQuery, parentEntity, nestedEntityTypeName, parentEntityResolver, operationResolver, context);
            }
        }
    }
}

//
// Resolves a nested entity.
//
async function resolveNestedEntity(nestedEntityQuery: IEntityQuery, parentEntity: any, nestedEntityTypeName: string, parentEntityResolver: IEntityQueryResolver, operationResolver: IQueryOperationResolver, context: any) {
    
    const nestedEntityResolverName = nestedEntityQuery.from !== undefined ? nestedEntityQuery.from : nestedEntityTypeName; //TODO: check "from is a string"
    const nestedEntityResolver = parentEntityResolver.nested![nestedEntityResolverName]; //todo: error check that nested and the resolver both exist.

    //
    // Resolve this entity.
    //
    const resolvedEntity = await nestedEntityResolver.invoke(parentEntity, nestedEntityQuery.args || {}, context); //TODO: Do these in parallel. TODO: error check that invoke fn exists.

    //
    // Plug the resolved entity into the query result.
    //
    parentEntity[nestedEntityTypeName] = resolvedEntity;

    //
    // Resolve nested entities.
    //
    const rootEntityResolver = operationResolver[nestedEntityResolverName]; //todo: error check that it exists!
    await resolveNestedEntities(nestedEntityQuery, resolvedEntity, rootEntityResolver, operationResolver, context);
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