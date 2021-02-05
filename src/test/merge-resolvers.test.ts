import { miniql, IQuery } from "..";
import { IQueryResolver } from "@miniql/core-types";

describe("merge resolvers", () => {

    it("can merge query resolvers", async () => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
                director: {
                    args: {
                        id: "5678",
                    },
                },
            },
        };

        const queryResolver1: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            name: "Inception",
                            year: 2010,
                        };
                    },
                },
            },
        };

        const queryResolver2: IQueryResolver = {
            get: {
                director: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("5678");

                        return {
                            id: "5678",
                            name: "Steven Spielberg",
                        };
                    },
                },
            },
        };

        const result = await miniql(query, [queryResolver1, queryResolver2], {});
        expect(result).toEqual({
            movie: {
                name: "Inception",
                year: 2010,
            },
            director: {
                id: "5678",
                name: "Steven Spielberg",
            },
        });
    });

    it("error when overwriting a resolver ", async () => {
        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const queryResolver1: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                    },
                },
            },
        };

        const queryResolver2: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                    },
                },
            },
        };

        await expect(miniql(query, [queryResolver1, queryResolver2], {}))
            .rejects
            .toThrow();        
    });

    it("error when overwring a sub field when parent is not an object", async () => {
        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const queryResolver1: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                    },
                },
            },
        };

        const queryResolver2: any = {
            get: {
                movie: {
                    invoke: {
                        bad: "data",
                    },
                },
            },
        };
        
        await expect(miniql(query, [queryResolver1, queryResolver2], {}))
            .rejects
            .toThrow();        
    });    
});
