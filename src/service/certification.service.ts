import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Certification, { CertificationDocument } from '../model/certification.model';

export async function createCertification(input: DocumentDefinition<CertificationDocument>) {
    return Certification.create(input);
}

export async function findCertifications(
    query: FilterQuery<CertificationDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Certification.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Certification.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Certification.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findCertification(
    query: FilterQuery<CertificationDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Certification.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateCertification(
    query: FilterQuery<CertificationDocument>,
    update: UpdateQuery<CertificationDocument>,
    options: QueryOptions
) {
    return Certification.findOneAndUpdate(query, update, options);
}

export async function deleteCertification(query: FilterQuery<CertificationDocument>) {
    return Certification.deleteOne(query);
}