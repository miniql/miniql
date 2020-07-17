
//
// Execute a query.
//
export async function miniql(query: any, root: any, context: any): Promise<any> {

    const output: any = {};

    for (const key of Object.keys(query)) {
        const resolver = root[key];
        const subQuery = query[key];
        output[key] = await resolver(subQuery, context);
        if (subQuery.relate) {
            for (const relateKey of Object.keys(subQuery.relate)) {
                const relateId = output[key][relateKey];
                const relateQuery: any = {};
                relateQuery[relateKey] = {
                    id: relateId,
                };
                const relateResult = await miniql(relateQuery, root, context);
                output[key][relateKey] = relateResult[relateKey];
            }
        }
    }

    return output;
}