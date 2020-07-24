import { miniql } from "..";

describe("entity query", () => {

    it("can update entity", async ()  => {

        const query = {
            update: {
                movie: {
                    args: {
                        id: "1234",
                        param: {
                            views: 5,
                        },
                    },
                },
            },
        };

        const root = {
            update: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
                    expect(args.param).toEqual({ views: 5 });
    
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
