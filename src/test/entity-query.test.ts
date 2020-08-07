import { miniql, IQuery, IQueryResolver } from "..";

describe("entity query", () => {

    it("can retreive entity", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: IQueryResolver = {
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

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                name: "Inception",
                year: 2010,
            },
        });
    });

    it("can retreive entity with explicitly named resolver", async ()  => {

        const query: IQuery = {
            get: {
                film: {
                    from: "movie",
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: IQueryResolver = {
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

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            film: {
                name: "Inception",
                year: 2010,
            },
        });
    });

    it("can do multiple operations in a single query", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
            update: {
                movie: {
                    args: {
                        id: "5678",
                        params: {
                            views: 5,
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
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
            update: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("5678");
        
                        return {
                            ok: true,
                        };
                    },
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

    it("can retreive separate entities", async ()  => {

        const query: IQuery = {
            get: {
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
            },
        };

        const root: IQueryResolver = {
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
                actor: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("5678");
        
                        return {
                            name: "Leonardo Dicaprio",
                            born: 1974,
                        };
                    },
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

    it("can retreive multiple entities with different aliases", async ()  => {

        const query: IQuery = {
            get: {
                movie1: {
                    from: "movie",
                    args: {
                        id: "1234",
                    },
                },
                movie2: {
                    from: "movie",
                    args: {
                        id: "5678",
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        if (args.id === "1234") {
                            return {
                                name: "Inception",
                                year: 2010,
                            };
                        }
                        else if (args.id === "5678") {
                            return {
                                name: "The Bourne Identity",
                                year: 2002,
                            };
                        }
                        else {
                            throw new Error(`Unexpected id ${args.id}.`);
                        }
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie1: {
                name: "Inception",
                year: 2010,
            },
            movie2: {
                name: "The Bourne Identity",
                year: 2002,
            },
        });
    });

    it("resolver can return undefined for entity not found", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        return undefined;
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: undefined,
        });
    });

    it("resolver can return null for entity not found", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        return null;
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: null,
        });
    });
});
