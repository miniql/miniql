import { miniql } from "..";

describe("entity search", () => {

    it("can get entities", async ()  => {

        const query = {
            movie: {
                args: {
                    skip: 0, // Simulates pagination.
                    limit: 2,
                    search: {
                        year: 2002, // Simulates search.
                    },
                },
            },
        };

        const root = {
            query: {
                movie: async (args: any, context: any) => {
                    expect(args.skip).toBe(0);
                    expect(args.limit).toBe(2);
                    expect(args.search.year).toBe(2002);
    
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
                movieInfo: async (args: any, context: any) => {
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
