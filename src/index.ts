import { t } from "typy";

//
// Execute a query.
//
export async function miniql(query: any, root: any, context: any): Promise<any> {

    const output: any = {};
    const typeRoot = root[query.type || "query"]; 

    for (const entityKey of Object.keys(query)) {
        if (entityKey === "type") {
            continue;
        }
        const resolver = typeRoot[entityKey]; // Todo: check for missing resolver.
        const subQuery = query[entityKey];
        output[entityKey] = await resolver(subQuery, context); //TODO: Do these in parallel.

        if (subQuery.lookup) {
            //
            // Lookup nested entities.
            //
            for (const entityName of Object.keys(subQuery.lookup)) {
                let entityIdFieldName = subQuery.lookup[entityName];
                if (!t(entityIdFieldName).isString) {
                    entityIdFieldName = entityName;
                }

                const nestedEntityId = output[entityKey][entityIdFieldName];
                let nestedEntity: any;
                if (t(nestedEntityId).isArray) {
                    nestedEntity = await Promise.all(
                        nestedEntityId.map(
                            (entityId: any) => lookupEntity(entityName, entityId, root, context)
                        )
                    );
                }
                else {
                    nestedEntity = await lookupEntity(entityName, nestedEntityId, root, context);
                }

                if (entityName !== entityIdFieldName) {
                    delete output[entityKey][entityIdFieldName];
                }

                output[entityKey][entityName] = nestedEntity;
            }
        }
    }

    return output;
}

//
// Look up an entity by id.
//
export async function lookupEntity(entityName: string, nestedEntityId: any, root: any, context: any) {
    const nestedEntityQuery: any = {
        type: "query",
    };
    nestedEntityQuery[entityName] = {
        id: nestedEntityId,
    };
    const nestedResult = await miniql(nestedEntityQuery, root, context);
    return nestedResult[entityName];
}
