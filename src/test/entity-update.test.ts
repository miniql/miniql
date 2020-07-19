import { miniql } from "..";

describe("entity query", () => {

    it("can update entity", async ()  => {

        const query = {
            op: "update",
            movie: {
                id: "1234",
                param: {
                    views: 5,
                },
            },
        };

        const root = {
            update: {
                movie: async (query: any, context: any) => {
                    expect(query.id).toBe("1234");
                    expect(query.param).toEqual({ views: 5 });
    
                    return {
                        ok: true,
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                ok: true,
            },
        });
    });

});
