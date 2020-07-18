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
                let entityIdFieldName: string | undefined = undefined;
                let outputFieldName: string;
                if (t(lookup).isObject) {
                    entityIdFieldName = lookup.from; //todo: Assert that from is a string! (or undefined.)
                    outputFieldName = lookup.as || nestedEntityKey;
                }
                else if (lookup === true) {
                    entityIdFieldName = nestedEntityKey;
                    outputFieldName = nestedEntityKey;
                }
                else {
                    throw new Error("Unexpected lookup descriptor: " + JSON.stringify(lookup, null, 4)); //todo: test me.
                }

                let nestedEntityId: any;
                if (entityIdFieldName) {
                    nestedEntityId = output[entityKey][entityIdFieldName]; //TODO: Error check the desc.
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
                            (entityId: any) => lookupEntity(nestedEntityKey, entityId, root, context)
                        )
                    );
                }
                else {
                    nestedEntity = await lookupEntity(nestedEntityKey, nestedEntityId, root, context);
                }

                if (entityIdFieldName) {
                    if (outputFieldName !== entityIdFieldName) {
                        delete output[entityKey][entityIdFieldName];
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
export async function lookupEntity(entityName: string, nestedEntityId: any, root: any, context: any) {
    const nestedEntityQuery: any = {
        type: "query",
    };
    nestedEntityQuery[entityName] = { //TODO: Is there a way to delegate this to the resolver? This code should know or care about "id".
        id: nestedEntityId,
    };
    const nestedResult = await miniql(nestedEntityQuery, root, context);
    return nestedResult[entityName];
}
