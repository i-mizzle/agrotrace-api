import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import PasswordReset, { PasswordResetDocument } from '../model/password-reset.model';


export async function createResetRequest(input: DocumentDefinition<PasswordResetDocument>) {
    return PasswordReset.create(input)
}

export async function findResetRequest(
    query: FilterQuery<PasswordResetDocument>,
    options: QueryOptions = { lean: true }
) {
    return PasswordReset.findOne(query, {}, options)
}

// export async function findAndUpdateConfirmation(
//     query: FilterQuery<ConfirmationCodeDocument>,
//     update: UpdateQuery<ConfirmationCodeDocument>,
//     options: QueryOptions
// ) {
//     return ConfirmationCode.findOneAndUpdate(query, update, options)
// }