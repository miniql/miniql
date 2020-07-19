import { miniql } from "..";

describe("nested entities", () => {

    it("can get one nested entity", async ()  => {

        const query = {
            movie: {
                id: "1234",
                lookup: {
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

    it("error when an unsupport lookup type is used", async ()  => {

        const query = {
            movie: {
                id: "1234",
                lookup: {
                    director: "--string-is-a-bad-lookup-type--",
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

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("can get one nested entity with id from field", async ()  => {

        const query = {
            movie: {
                id: "1234",
                lookup: {
                    director: { from: "directorId", }, // Lookup director entity by directorId.
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

    it("can retrieve multiple nested entities", async ()  => {

        const query = {
            movie: {
                id: "1234",
                lookup: {
                    actor: true,
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
                        actor: [
                            "5678",
                            "5679",
                        ],
                    };
                },
    
                actor: async (query: any, context: any) => {
                    if (query.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (query.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + query.id);
                    }    
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                actor: [
                    {
                        id: "5678",
                        name: "Tom Cruise",
                    },
                    {
                        id: "5679",
                        name: "Samantha Morton",
                    },
                ],
            },
        });
    });    

    it("can retrieve multiple nested entities with id from field", async ()  => {

        const query = {
            movie: {
                id: "1234",
                lookup: {
                    actor: {
                        from: "actorIds",
                        as: "actors",
                    },
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
                        actorIds: [
                            "5678",
                            "5679",
                        ],
                    };
                },
    
                actor: async (query: any, context: any) => {
                    if (query.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (query.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + query.id);
                    }    
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                actors: [
                    {
                        id: "5678",
                        name: "Tom Cruise",
                    },
                    {
                        id: "5679",
                        name: "Samantha Morton",
                    },
                ],
            },
        });
    });    

    it("can retrieve multiple nested entities with id map", async ()  => {

        const query = {
            movie: {
                id: "1234",
                lookup: {
                    actor: {
                        as: "actors",
                    },
                },
            },
        };

        const root = {
            query: {
                // Find the actors for a particular movie.
                "movie=>actor": async (query: any, context: any) => {
                    expect(query.id).toBe("1234");

                    return [
                        "5678",
                        "5679",
                    ];
                },

                movie: async (query: any, context: any) => {
                    expect(query.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                    };
                },
    
                actor: async (query: any, context: any) => {
                    if (query.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (query.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + query.id);
                    }    
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                actors: [
                    {
                        id: "5678",
                        name: "Tom Cruise",
                    },
                    {
                        id: "5679",
                        name: "Samantha Morton",
                    },
                ],
            },
        });
    });    

    it("error when entity map is not found", async ()  => {

        const query = {
            movie: {
                id: "1234",
                lookup: {
                    actor: {
                        as: "actors",
                    },
                },
            },
        };

        const root = {
            query: {
                // There is no entity map function!
                //
                // "movie=>actor": async (query: any, context: any) => {
                //     expect(query.id).toBe("1234");

                //     return [
                //         "5678",
                //         "5679",
                //     ];
                // },

                movie: async (query: any, context: any) => {
                    expect(query.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                    };
                },
    
                actor: async (query: any, context: any) => {
                    if (query.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (query.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + query.id);
                    }    
                },
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });
});
