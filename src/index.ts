
//
// Execute a query.
//
export async function miniql(query: any, root: any, context: any): Promise<any> {

    const output: any = {};
    const typeRoot = root[query.type || "query"]; 

    for (const key of Object.keys(query)) {
        if (key === "type") {
            continue;
        }
        const resolver = typeRoot[key]; // Todo: check for missing resolver.
        const subQuery = query[key];
        output[key] = await resolver(subQuery, context);
        if (subQuery.relate) {
            for (const relateKey of Object.keys(subQuery.relate)) {
                const relateId = output[key][relateKey];
                const relateQuery: any = {};
                relateQuery[relateKey] = {
                    type: "query",
                    id: relateId,
                };
                const relateResult = await miniql(relateQuery, root, context);
                output[key][relateKey] = relateResult[relateKey];
            }
        }
    }

    return output;
}