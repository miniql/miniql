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
    
                    return [
                        {
                            name: "Minority Report",
                            year: 2002,
                        },
                        {
                            name: "The Bourne Identity",
                            year: 2002,
                        },
                    ];
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: [
                {
                    name: "Minority Report",
                    year: 2002,
                },
                {
                    name: "The Bourne Identity",
                    year: 2002,
                },
            ],
        });
    });

    it("can get total entities returned from resolver", async ()  => {

        const query = {
            movieInfo: {
            },
        };

        const root = {
            query: {
                movieInfo: async (query: any, context: any) => {
                    return {
                        total: 202, // Total number of movies.
                    };
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movieInfo: {
                total: 202,
            },
        });
    });
});
