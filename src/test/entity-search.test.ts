import { miniql } from "..";

describe("entity search", () => {

    it("can get entities", async ()  => {

        const query = {
            movie: {
                skip: 0, // Simulates pagination.
                limit: 2,
                search: {
                    year: 2002, // Simulates search.
                },
                include: {
                    name: true, // Restrict results.
                    year: true,
                },
                exclude: { // Exclude results
                    director: true,
                },
            },
        };

        const root = {
            query: {
                movie: async (query: any, context: any) => {
                    expect(query.skip).toBe(0);
                    expect(query.limit).toBe(2);
                    expect(query.search.year).toBe(2002);
                    expect(query.include.name).toBe(true);
                    expect(query.include.year).toBe(true);
                    expect(query.exclude.director).toBe(true);
    
                    return {
                        total: 20,
                        results: [
                            {
                                name: "Minority Report",
                                year: 2002,
                            },
                            {
                                name: "The Bourne Identity",
                                year: 2002,
                            },
                        ],
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                total: 20,
                results: [
                    {
                        name: "Minority Report",
                        year: 2002,
                },
                    {
                        name: "The Bourne Identity",
                        year: 2002,
                    },
                ],
            },
        });
    });
});
