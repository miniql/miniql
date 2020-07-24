import { miniql } from "..";

describe("nested entities", () => {

    it("can get one nested entity", async ()  => {

        const query = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    lookup: {
                        director: true,
                    },
                },
            },
        };

        const root = {
            get: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                        director: { id: "5678" }, //TODO: !!!
                    };
                },
    
                director: async (args: any, context: any) => {
                    expect(args.id).toBe("5678");
    
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
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    lookup: {
                        director: "--string-is-a-bad-lookup-type--",
                    },
                },
            },
        };

        const root = {
            get: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                        director: { id: "5678" }, //TODO: !!!
                    };
                },
    
                director: async (args: any, context: any) => {
                    expect(args.id).toBe("5678");
    
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
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    lookup: {
                        director: { from: "directorId", }, // Lookup director entity by directorId.
                    },
                },
            },
        };

        const root = {
            get: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                        directorId: { id: "5678" }, //TODO: !!!
                    };
                },
    
                director: async (args: any, context: any) => {
                    expect(args.id).toBe("5678");
    
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
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    lookup: {
                        actor: true,
                    },
                },
            },
        };

        const root = {
            get: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                        actor: [
                            { id: "5678" }, //TODO: !!!
                            { id: "5679" }, //TODO: !!!
                        ],
                    };
                },
    
                actor: async (args: any, context: any) => {
                    if (args.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (args.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + args.id);
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
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    lookup: {
                        actor: {
                            from: "actorIds",
                            as: "actors",
                        },
                    },
                },
            },
        };

        const root = {
            get: {
                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                        actorIds: [
                            { id: "5678" }, //todo:
                            { id: "5679" }, //todo:
                        ],
                    };
                },
    
                actor: async (args: any, context: any) => {
                    if (args.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (args.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + args.id);
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

    it("can retrieve multiple entiites each with a single nested entity", async ()  => {

        const query = {
            get: {
                movie: {
                    lookup: {
                        director: {
                            from: "directorId",
                            as: "director",
                        },
                    },
                },
            },
        };

        const root = {
            get: {
                movie: async (args: any, context: any) => {
                    return [
                        {
                            name: "Minority Report",
                            year: 2002,
                            directorId: { id: "1234" }, //todo:
                        },
                        {
                            name: "The Bourne Identity",
                            year: 2002,
                            directorId: { id: "5678" }, //todo:
                        },
                    ];
                },
    
                director: async (args: any, context: any) => {
                    if (args.id === "1234") {
                        return {
                            id: "1234",
                            name: "Steven Spielberg",
                        };
                    }
                    else if (args.id === "5678") {
                        return {
                            id: "5678",
                            name: "Doug Liman",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + args.id);
                    }    
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: [
                {
                    name: "Minority Report",
                    year: 2002,
                    director: {
                        id: "1234",
                        name: "Steven Spielberg",
                    },
                },
                {
                    name: "The Bourne Identity",
                    year: 2002,
                    director: {
                        id: "5678",
                        name: "Doug Liman",
                    },
                },
            ],
        });
    });    

    it("can retrieve multiple entiites each with multiple nested entities", async ()  => {

        const query = {
            get: {
                movie: {
                    lookup: {
                        actor: {
                            from: "actorIds",
                            as: "actors",
                        },
                    },
                },
            },
        };

        const root = {
            get: {
                movie: async (args: any, context: any) => {
                    return [
                        {
                            name: "Minority Report",
                            year: 2002,
                            actorIds: [
                                { id: "1234" }, //todo:
                                { id: "5678" }, //todo:
                            ],
                        },
                        {
                            name: "The Bourne Identity",
                            year: 2002,
                            actorIds: [
                                { id: "9123" }, //todo:
                            ],
                        },
                    ];
                },
    
                actor: async (args: any, context: any) => {
                    if (args.id === "1234") {
                        return {
                            id: "1234",
                            name: "Tom Cruise",
                        };
                    }
                    else if (args.id === "5678") {
                        return {
                            id: "5678",
                            name: "Samantha Morton",
                        };
                    }
                    else if (args.id === "9123") {
                        return {
                            id: "9123",
                            name: "Matt Daemon",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + args.id);
                    }    
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: [
                {
                    name: "Minority Report",
                    year: 2002,
                    actors: [
                        {
                            id: "1234",
                            name: "Tom Cruise",
                        },
                        {
                            id: "5678",
                            name: "Samantha Morton",
                        },
                    ],
                },
                {
                    name: "The Bourne Identity",
                    year: 2002,
                    actors: [
                        {
                            id: "9123",
                            name: "Matt Daemon",
                        },
                    ],
                },
            ],
        });
    });    

    it("can retrieve multiple nested entities using entity map fn", async ()  => {

        const query = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    lookup: {
                        actor: {
                            as: "actors",
                        },
                    },
                },
            },
        };

        const root = {
            get: {
                // Find the actors for a particular movie.
                "movie=>actor": async (args: any, context: any) => {
                    expect(args.entity.id).toBe("1234");

                    return [
                        { id: "5678" },
                        { id: "5679" },
                    ];
                },

                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                    };
                },
    
                actor: async (args: any, context: any) => {
                    if (args.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (args.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + args.id);
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
            get: {
                movie: {
                    id: "1234",
                    lookup: {
                        actor: {
                            as: "actors",
                        },
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

                movie: async (args: any, context: any) => {
                    expect(args.id).toBe("1234");
    
                    return {
                        id: "1234",
                        name: "Minority Report",
                        year: 2002,
                    };
                },
    
                actor: async (args: any, context: any) => {
                    if (args.id === "5678") {
                        return {
                            id: "5678",
                            name: "Tom Cruise",
                        };
                    }
                    else if (args.id === "5679") {
                        return {
                            id: "5679",
                            name: "Samantha Morton",
                        };
                    }
                    else {
                        throw new Error("Unexpected id: " + args.id);
                    }    
                },
            },
        };

        await expect(miniql(query, root, {}))
            .rejects
            .toThrow();
    });

    it("can retrieve multiple entities with multipled nested entities using entity map fn", async ()  => {

        const query = {
            get: {
                movie: {
                    lookup: {
                        actor: {
                            as: "actors",
                        },
                    },
                },
            },
        };

        const root = {
            get: {
                // Find the actors for a particular movie.
                "movie=>actor": async (args: any, context: any) => {
                    if (args.entity.id === "1234") {
                        return [
                            { id: "2345" }, //TODO:
                            { id: "3456" }, //todo:
                        ];
                    }
                    else if (args.entity.id === "5678") {
                        return [
                            { id: "4567" }, //todo:
                        ];
                    }
                    else {
                        throw new Error(`Unexpected movie id ${args.entity.id}.`);
                    }
                },

                movie: async (args: any, context: any) => {
                    return [
                        {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                        },
                        {
                            id: "5678",
                            name: "The Bourne Identity",
                            year: 2002,
                        },
                    ];
                },
    
                actor: async (args: any, context: any) => {
                    if (args.id === "2345") {
                        return {
                            id: "2345",
                            name: "Tom Cruise",
                        };
                    }
                    else if (args.id === "3456") {
                        return {
                            id: "3456",
                            name: "Samantha Morton",
                        };
                    }
                    else if (args.id === "4567") {
                        return {
                            id: "4567",
                            name: "Matt Daemon",
                        };
                    }
                    else {
                        throw new Error("Unexpected actor id: " + args.id);
                    }    
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: [
                {
                    id: "1234",
                    name: "Minority Report",
                    year: 2002,
                    actors: [
                        {
                            id: "2345",
                            name: "Tom Cruise",
                        },
                        {
                            id: "3456",
                            name: "Samantha Morton",
                        },
                    ],
                },
                {
                    id: "5678",
                    name: "The Bourne Identity",
                    year: 2002,
                    actors: [
                        {
                            id: "4567",
                            name: "Matt Daemon",
                        },
                    ],
                },
            ],
        });
    });    
});
