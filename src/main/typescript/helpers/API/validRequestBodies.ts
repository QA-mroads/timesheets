export function createPetRequestBody(name: string, id: number, status: string) {
    return {
        id,
        category: {
            id: 1,
            name: 'Dogs',
        },
        name,
        photoUrls: ['string'],
        tags: [
            {
                id: 1,
                name: 'tag1',
            },
        ],
        status,
    }
}
