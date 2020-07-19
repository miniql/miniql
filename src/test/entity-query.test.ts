import { miniql } from "..";

describe("entity query", () => {

    it("can retreive entity", async ()  => {

        const query = {
            op: "query",
            movie: {
                id: "1234",
            },
        };

        const root = {
            query: {
                movie: async (query: any, context: any) => {
                    expect(query.id).toBe("1234");
    
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

    it("can retreive multiple entities", async ()  => {

        const query = {
            movie: {
                id: "1234",
            },
            actor: {
                id: "5678",
            },
        };

        const root = {
            query: {
                movie: async (query: any, context: any) => {
                    expect(query.id).toBe("1234");
    
                    return {
                        name: "Inception",
                        year: 2010,
                    };
                },
                actor: async (query: any, context: any) => {
                    expect(query.id).toBe("5678");
    
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
