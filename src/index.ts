import { t } from "typy";
import { tupleExpression } from "@babel/types";

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

        const resolver = typeRoot[entityKey]; // Todo: check for missing resolver. todo: Should also check in the root.
        const subQuery = query[entityKey];
        output[entityKey] = await resolver(subQuery, context); //TODO: Do these in parallel.

        if (subQuery.lookup) {
            //
            // Lookup nested entities.
            //
            for (const nestedEntityKey of Object.keys(subQuery.lookup)) {
                const lookup = subQuery.lookup[nestedEntityKey];
                let nestedQueryFieldName: string | undefined = undefined;
                let outputFieldName: string;
                if (t(lookup).isObject) {
                    nestedQueryFieldName = lookup.from; //todo: Assert that from is a string! (or undefined.)
                    outputFieldName = lookup.as || nestedEntityKey;
                }
                else if (lookup === true) {
                    nestedQueryFieldName = nestedEntityKey;
                    outputFieldName = nestedEntityKey;
                }
                else {
                    throw new Error("Unexpected lookup descriptor: " + JSON.stringify(lookup, null, 4)); //todo: test me.
                }

                let nestedEntityQuery: any;
                if (nestedQueryFieldName) {
                    nestedEntityQuery = output[entityKey][nestedQueryFieldName]; //TODO: Error check the desc.
                }
                else {
                    const mapFnName = `${entityKey}=>${nestedEntityKey}`;
                    const mapFn: (query: any, context: any) => any = typeRoot[mapFnName]; //todo: Default to fn in root. Test for undefined fn.
                    nestedEntityQuery = await mapFn(subQuery, context);
                }

                let nestedEntity: any;
                if (t(nestedEntityQuery).isArray) {
                    nestedEntity = await Promise.all(
                        nestedEntityQuery.map(
                            (singleNestedEntityQuery: any) => 
                                lookupEntity(nestedEntityKey, singleNestedEntityQuery, root, context)
                        )
                    );
                }
                else {
                    nestedEntity = await lookupEntity(nestedEntityKey, nestedEntityQuery, root, context); //TODO: Do these in parallel.
                }

                if (nestedQueryFieldName) {
                    if (outputFieldName !== nestedQueryFieldName) {
                        delete output[entityKey][nestedQueryFieldName];
                    }
                }

                output[entityKey][outputFieldName] = nestedEntity;
            }
        }
    }

    return output;
}

//
// Look up an entity by id.
//
export async function lookupEntity(entityKey: string, nestedEntityQuery: any, root: any, context: any) {
    const query: any = {
        type: "query",
    };
    query[entityKey] = nestedEntityQuery;
    const nestedResult = await miniql(query, root, context); //TODO: Do these in parallel.
    return nestedResult[entityKey];
}
