import { miniql } from "..";

describe("entity query", () => {

    it("can retreive entity", async ()  => {

        const query = {
            op: "query",
            movie: {
                args: {
                    id: "1234",
                },
            },
        };

        const root = {
            query: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        name: "Inception",
                        year: 2010,
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                name: "Inception",
                year: 2010,
            },
        });
    });

    it("can retreive entity named resolver", async ()  => {

        const query = {
            op: "query",
            film: {
                from: "movie",
                args: {
                    id: "1234",
                },
            },
        };

        const root = {
            query: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        name: "Inception",
                        year: 2010,
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            film: {
                name: "Inception",
                year: 2010,
            },
        });
    });

    it("error when resolver is not found", async ()  => {

        const query = {
            op: "query",
            movie: {
                args: {
                    id: "1234",
                },
            },
        };

        const root = {
            query: {
                // No resolver. 
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when operation is not found", async ()  => {

        const query = {
            op: "query",
            movie: {
                args: {
                    id: "1234",
                },
            },
        };

        const root = {
            // No operation supported.
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("can retreive separate entities", async ()  => {

        const query = {
            movie: {
                args: {
                    id: "1234",
                },
            },
            actor: {
                args: {
                    id: "5678",
                },
            },
        };

        const root = {
            query: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        name: "Inception",
                        year: 2010,
                    };
                },
                actor: async (args: any, context: any) => {
                    expect(args.id).toBe("5678");
    
                    return {
                        name: "Leonardo Dicaprio",
                        born: 1974,
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                name: "Inception",
                year: 2010,
            },
            actor: {
                name: "Leonardo Dicaprio",
                born: 1974,
            },
        });
    });
});
