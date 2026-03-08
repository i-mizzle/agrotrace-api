import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import ConfirmationCode, { ConfirmationCodeDocument } from '../model/confirmation-code.model';

export async function createConfirmationCode (input: DocumentDefinition<ConfirmationCodeDocument>) {
    return ConfirmationCode.create(input)
}

export async function findConfirmationCode(
    query: FilterQuery<ConfirmationCodeDocument>,
    options: QueryOptions = { lean: true }
) {
    return ConfirmationCode.findOne(query, {}, options)
}

export async function findAndUpdateConfirmation(
    query: FilterQuery<ConfirmationCodeDocument>,
    update: UpdateQuery<ConfirmationCodeDocument>,
    options: QueryOptions
) {
    return ConfirmationCode.findOneAndUpdate(query, update, options)
}