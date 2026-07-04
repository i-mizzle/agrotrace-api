import { object, string, number, boolean, array } from "yup";

export const createEventSchema = object({
    body: object({
        asset: string().required('asset id is required'),
        eventCategory: string().required('event category is required').oneOf(['production', 'health', 'movement', 'processing', 'quality', 'export']),
        eventTypeCategory: string().required('event type category is required'),
        eventType: string().required('event type is required'),
        newLocation: string().when('eventType', {
            is: (eventType: string) => ['transfer', 'relocation'].includes(eventType),
            then: string().required('new location is required for transfer and relocation events'),
            otherwise: string().notRequired()
        }),
        date: string().required('date is required'),
        performedBy: string(),
        recordedOffline: boolean(),
        notes: array().of(object({
            note: string()
        })),
        attachments: array().of(object({
            type: string().oneOf(['image', 'video', 'document']),
            url: string()
        })),
        quantityAffected: number(),
        weightAffected: number(),
        costEstimate: number(),
        mortalityCount: number(),
        nextDueDate: string()
    })
});

const params = {
    params: object({
        eventId: string().required('event id is required as a path param')
    })
}

export const getEventSchema = object({
    ...params
})
