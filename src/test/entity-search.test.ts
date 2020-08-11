import { miniql, IQuery } from "..";
import { IQueryResolver } from "@miniql/core-types";

describe("entity search", () => {

    it("can get entities", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        skip: 0, // Simulates pagination.
                        limit: 2,
                        search: {
                            year: 2002, // Simulates search.
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
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
            get: {
                movieInfo: {
                },
            },
        };

        const root = {
            get: {
                movieInfo: {
                    invoke: async (args: any, context: any) => {
                        return {
                            total: 202, // Total number of movies.
                        };
                    },
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
