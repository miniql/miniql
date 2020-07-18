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

                let nestedEntityId: any;
                if (nestedQueryFieldName) {
                    nestedEntityId = output[entityKey][nestedQueryFieldName]; //TODO: Error check the desc.
                }
                else {
                    const mapFnName = `${entityKey}=>${nestedEntityKey}`;
                    const mapFn: (query: any, context: any) => any = typeRoot[mapFnName]; //todo: Default to fn in root. Test for undefined fn.
                    nestedEntityId = await mapFn(subQuery, context);
                }

                let nestedEntity: any;
                if (t(nestedEntityId).isArray) {
                    nestedEntity = await Promise.all(
                        nestedEntityId.map(
                            (entityId: any) => 
                                lookupEntity(nestedEntityKey, entityId, root, context)
                        )
                    );
                }
                else {
                    nestedEntity = await lookupEntity(nestedEntityKey, nestedEntityId, root, context); //TODO: Do these in parallel.
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
export async function lookupEntity(entityKey: string, nestedEntityId: any, root: any, context: any) {
    const nextedQuery: any = {
        type: "query",
    };
    nextedQuery[entityKey] = {
        id: nestedEntityId,
    };
    const nestedResult = await miniql(nextedQuery, root, context); //TODO: Do these in parallel.
    return nestedResult[entityKey];
}
