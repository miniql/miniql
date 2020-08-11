import { miniql, IQuery } from "..";
import { IQueryResolver } from "@miniql/core-types";

describe("entity query", () => {

    it("error when query operation is missing", async ()  => {

        const query: any = {
            // -- missing query operation.
        };

        const root: IQueryResolver = {
            get: {
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when query operation is missing", async ()  => {

        const query: any = {
            get: null,
        };

        const root: IQueryResolver = {
            get: {
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });
    
    it("error when query operation has bad type", async ()  => {

        const query: any = {
            get: "--bad-operation-type--",
        };

        const root: IQueryResolver = {
            get: {
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when entity query is missing", async ()  => {

        const query: any = {
            get: {
                movie: null,
            },
        };

        const root: IQueryResolver = {
            get: {
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when entity query has bad type", async ()  => {

        const query: any = {
            get: {
                movie: "--bad-type",
            },
        };

        const root: IQueryResolver = {
            get: {
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when operation resolver has bad type", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: any = {
            get: "--bad-operation-type--",
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when resolver is missing", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: any = {
            get: {
                // No resolver. 
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when resolver invoke function is missing", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: any = {
            get: {
                movie: {
                    // -- missing invoke function.
                },
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when resolver invoke function is not actually a function", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                },
            },
        };

        const root: any = {
            get: {
                movie: {
                    invoke: "--bad-type--",
                },
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when operation is not found", async ()  => {

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
            // No operation supported.
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when an unsupport resolve type is used", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: "--string-is-a-bad-lookup-type--" as any,
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
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            director: "5678",
                        };
                    },

                    nested: {
                        director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.director).toBe("5678");

                                return {
                                    id: "5678",
                                    name: "Steven Spielberg",
                                };
                            },
                        },
                    },
                },
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when nested resolve function is missing", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
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
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            director: "5678",
                        };
                    },

                    nested: {
                        // -- nested resolver for "director" is missing.
                    },
                },
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("error when nested resolvers are missing", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
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
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            director: "5678",
                        };
                    },

                    // -- nested resolvers are missing.
                },
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });
});
