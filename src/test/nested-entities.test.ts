import { miniql } from "..";

describe("nested entities", () => {

    it("can get one nested entity", async ()  => {

        const query = {
            movie: {
                id: "1234",
                relate: {
                    director: true,
                },
            },
        };

        const root = {
            query: {
                movie: async (query: any, context: any) => {
                    expect(query.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                        director: "5678",
                    };
                },
    
                director: async (query: any, context: any) => {
                    expect(query.id).toBe("5678");
    
                    return {
                        id: "5678",
                        name: "Steven Spielberg",
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                director: {
                    id: "5678",
                    name: "Steven Spielberg",
                },
            },
        });
    });

    it("can get one nested entity with key", async ()  => {

        const query = {
            movie: {
                id: "1234",
                relate: {
                    director: "directorId",
                },
            },
        };

        const root = {
            query: {
                movie: async (query: any, context: any) => {
                    expect(query.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                        directorId: "5678",
                    };
                },
    
                director: async (query: any, context: any) => {
                    expect(query.id).toBe("5678");
    
                    return {
                        id: "5678",
                        name: "Steven Spielberg",
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                director: {
                    id: "5678",
                    name: "Steven Spielberg",
                },
            },
        });
    });
});
