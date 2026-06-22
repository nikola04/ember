import * as jose from 'jose';
import { env } from './env';

const ALGORITHM = 'HS256';
const SECRET = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = 'ember';
const AUDIENCE = 'ember:client';

export const signJwt = async <T extends jose.JWTPayload>({
    payload,
    expiry,
}: {
    payload: T;
    expiry: string | number | Date;
}): Promise<string> => {
    return new jose.SignJWT(payload)
        .setProtectedHeader({ alg: ALGORITHM })
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setExpirationTime(expiry)
        .sign(SECRET);
};

export const verifyJwt = async (jwt: string): Promise<jose.JWTPayload | null> => {
    try {
        const { payload } = await jose.jwtVerify(jwt, SECRET, {
            issuer: ISSUER,
            audience: AUDIENCE,
            algorithms: [ALGORITHM],
        });
        return payload;
    } catch {
        return null;
    }
};
