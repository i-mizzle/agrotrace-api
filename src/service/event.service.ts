import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Event, { EventDocument } from '../model/event.model';

export async function createEvent(input: DocumentDefinition<EventDocument>) {
    return Event.create(input);
}

export async function findEvents(
    query: FilterQuery<EventDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Event.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Event.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Event.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findEvent(
    query: FilterQuery<EventDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Event.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateEvent(
    query: FilterQuery<EventDocument>,
    update: UpdateQuery<EventDocument>,
    options: QueryOptions
) {
    return Event.findOneAndUpdate(query, update, options);
}

export async function deleteEvent(query: FilterQuery<EventDocument>) {
    return Event.deleteOne(query);
}