
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
        output[entityKey] = await resolver(subQuery, context);
        if (subQuery.relate) {
            for (const relateKey of Object.keys(subQuery.relate)) {
                let entityRelationIdKey = subQuery.relate[relateKey];
                if (typeof(entityRelationIdKey) !== "string") {
                    entityRelationIdKey = relateKey;
                }
                const relationQueryId = output[entityKey][entityRelationIdKey];
                const relateQuery: any = {};
                relateQuery[relateKey] = {
                    type: "query",
                    id: relationQueryId,
                };
                const relateResult = await miniql(relateQuery, root, context);
                if (relateKey !== entityRelationIdKey) {
                    delete output[entityKey][entityRelationIdKey];
                }
                output[entityKey][relateKey] = relateResult[relateKey];
            }
        }
    }

    return output;
}