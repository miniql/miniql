
//
// Execute a query.
//
export async function miniql(query: any, root: any, context: any): Promise<any> {

    const output: any = {};

    for (const key of Object.keys(query)) {
        output[key] = await root[key](query[key], context);
    }

    return output;
}