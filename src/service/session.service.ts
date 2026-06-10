import { LeanDocument, FilterQuery, UpdateQuery } from 'mongoose';
import config from 'config';
import { get } from "lodash";
import Session, { SessionDocument } from '../model/session.model';
import  { UserDocument } from '../model/user.model';
import { decode, sign } from "../utils/jwt.utils";
import { findUser } from "./user.service";
import { resolvePublicIdToObjectId } from '../utils/public-id-resolver';

export async function createSession(userId: UserDocument['_id'] | string, userAgent: string, storeId?: string) {
    return Session.create({ user: userId, userAgent, business: storeId });
}

export function createAccessToken({
    user,
    session
}: {
    user: 
    | Omit<UserDocument, 'password'>
    | LeanDocument<Omit<UserDocument, 'password'>>;
    session: 
    | Omit<SessionDocument, 'password'>
    | LeanDocument<Omit<SessionDocument, 'password'>>;
}) {
    const accessToken = sign(
        { ...{
            id: user.id,
            userType: user.userType,
            email: user.email,
            phone: user.phone,
            firstName: user.name,
            permissions: user.permissions
        }, session: session.id },
        config.get('privateKey'),
        { expiresIn: config.get('accessTokenTtl') }
    );

    return accessToken;
}

export async function reIssueAccessToken ({ refreshToken }: { refreshToken: string }) {
    // decode the refresh token
    const { decoded } = decode(refreshToken);
    const sessionPublicId = get(decoded, 'id');

    if(!decoded || !sessionPublicId) return false;

    // get the session 
    const session = await Session.findOne({ id: sessionPublicId });

    // make sure the session is still valid
    if (!session || !session?.valid) return false;

    const user = await findUser({ _id: session.user })
    if(!user) return false;

    const accessToken = createAccessToken({ user, session })

    return accessToken;
}

export async function resolveSessionPublicIdToObjectId(
    publicId: string,
    throwOnMissing = true
) {
    return resolvePublicIdToObjectId(Session, publicId, { throwOnMissing });
}

export async function updateSession(
    query: FilterQuery<SessionDocument>,
    update: UpdateQuery<SessionDocument>
) {
    return Session.updateOne(query, update);
}
  
export async function findSessions(query: FilterQuery<SessionDocument>) {
    return Session.find(query).lean();
}

export async function findSession(query: FilterQuery<SessionDocument>) {
    return Session.findOne(query).lean();
}