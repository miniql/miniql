import { miniql } from "..";

describe("entity query", () => {

    it("can get entity by name", async ()  => {

        const query = {
            movie: {
                name: "Inception",
            },
        };

        const root = {
            movie: async (query: any, context: any) => {
                expect(query.name).toBe("Inception");

                return {
                    name: "Inception",
                    year: 2010,
                };
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

    it("can get multiple entities", async ()  => {

        const query = {
            movie: {
                name: "Inception",
            },
            actor: {
                name: "Leonardo Dicaprio",
            },
        };

        const root = {
            movie: async (query: any, context: any) => {
                expect(query.name).toBe("Inception");

                return {
                    name: "Inception",
                    year: 2010,
                };
            },
            actor: async (query: any, context: any) => {
                expect(query.name).toBe("Leonardo Dicaprio");

                return {
                    name: "Leonardo Dicaprio",
                    born: 1974,
                };
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
});
