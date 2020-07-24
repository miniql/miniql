import { t } from "typy";

//
// Execute a query.
//
export async function miniql(query: any, root: any, context: any): Promise<any> {

    const output: any = {};
    const opName = query.op || "query"
    const operation = root[opName];
    if (!operation) {
        throw new Error(`Operation ${opName} is not supported.`);
    }

    for (const entityKey of Object.keys(query)) {
        if (entityKey === "op") {
            continue;
        }

        const resolver = operation[entityKey];
        if (!resolver) {
            throw new Error(`Failed to find resolver for operation ${opName} on enity ${entityKey}.`);
        }
        const subQuery = query[entityKey];
        const entity = await resolver(subQuery.args || {}, context); //TODO: Do these in parallel.
        output[entityKey] = entity;

        if (subQuery.lookup) {
            //
            // Lookup nested entities.
            //
            for (const nestedEntityKey of Object.keys(subQuery.lookup)) {
                const lookup = subQuery.lookup[nestedEntityKey];
                let nestedQueryFieldName: string | undefined;
                let outputFieldName: string;
                if (t(lookup).isObject) {
                    nestedQueryFieldName = lookup.from;
                    outputFieldName = lookup.as || nestedEntityKey;
                }
                else if (lookup === true) {
                    nestedQueryFieldName = nestedEntityKey;
                    outputFieldName = nestedEntityKey;
                }
                else {
                    throw new Error(`Unsupported type for "lookup" field: ${typeof(lookup)}.`);
                }

                if (t(entity).isArray) {
                    await Promise.all(
                        entity.map((singleEntity: any) => {
                            return resolveEntity(nestedQueryFieldName, outputFieldName, singleEntity, entityKey, nestedEntityKey, operation, opName, context, root)
                        })
                    );
                }
                else {
                    await resolveEntity(nestedQueryFieldName, outputFieldName, entity, entityKey, nestedEntityKey, operation, opName, context, root);
                }
            }
        }
    }

    return output;
}

//
// Resolve a single entity.
//
async function resolveEntity(nestedQueryFieldName: string | undefined, outputFieldName: string, entity: any, entityKey: string, nestedEntityKey: string, operation: any, opName: any, context: any, root: any): Promise<void> {
    let queryArgs: any;
    if (nestedQueryFieldName) {
        queryArgs = entity[nestedQueryFieldName]; //TODO: just need to execute a map fn here to package the id as "args".
    }
    else {
        const mapFnName = `${entityKey}=>${nestedEntityKey}`;
        const mapFn: (query: any, context: any) => any | undefined = operation[mapFnName];
        if (!mapFn) {
            throw new Error(`Failed to find entity mapping function ${mapFnName} for operation ${opName}`);
        }
        queryArgs = await mapFn({ entity: entity }, context);
    }

    let nestedEntity: any;
    if (t(queryArgs).isArray) {
        nestedEntity = await Promise.all(queryArgs.map((args: any) => lookupEntity(nestedEntityKey, args, root, context)));
    }
    else {
        nestedEntity = await lookupEntity(nestedEntityKey, queryArgs, root, context); //TODO: Do these in parallel.
    }

    if (nestedQueryFieldName) {
        if (outputFieldName !== nestedQueryFieldName) {
            delete entity[nestedQueryFieldName];
        }
    }

    entity[outputFieldName] = nestedEntity;
}

//
// Look up an entity by id.
//
export async function lookupEntity(entityKey: string, queryArgs: any, root: any, context: any) {
    const nestedQuery: any = {
        op: "query",
    };
    nestedQuery[entityKey] = {
        args: queryArgs,
    };
    const nestedResult = await miniql(nestedQuery, root, context); //TODO: Do these in parallel.
    return nestedResult[entityKey];
}
