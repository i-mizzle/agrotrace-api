import jwt from 'jsonwebtoken';
import config from 'config';

const privateKey = config.get('privateKey') as string;

export function sign(object: Object, privateKey: jwt.Secret, options?: jwt.SignOptions | undefined) {
    // Default to HS256 if no algorithm is specified
    const signOptions: jwt.SignOptions = {
        algorithm: 'HS256',
        ...options
    };
    return jwt.sign(object, privateKey, signOptions);
}

export function decode(token: string) {
    try {
        // Explicitly specify allowed algorithms to prevent algorithm confusion attacks
        const decoded = jwt.verify(token, privateKey, {
            algorithms: ['HS256']
        });

        return {valid: true, expired: false, decoded}
    } catch (error:any) {
        return {
            valid: false,
            expired: error.message === 'jwt expired' || error.message.includes('expired'),
            decoded: null
        }
    }
}