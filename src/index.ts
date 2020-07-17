
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
            for (const nestedEntityKey of Object.keys(subQuery.lookup)) {
                let entityIdFieldName = subQuery.lookup[nestedEntityKey];
                if (typeof(entityIdFieldName) !== "string") {
                    entityIdFieldName = nestedEntityKey;
                }
                const nestedEntityId = output[entityKey][entityIdFieldName];
                const nestedEntityQuery: any = {
                    type: "query",
                };
                nestedEntityQuery[nestedEntityKey] = {
                    id: nestedEntityId,
                };
                const nestedResult = await miniql(nestedEntityQuery, root, context);
                if (nestedEntityKey !== entityIdFieldName) {
                    delete output[entityKey][entityIdFieldName];
                }
                output[entityKey][nestedEntityKey] = nestedResult[nestedEntityKey];
            }
        }
    }

    return output;
}