import { customAlphabet } from 'nanoid';
import { Document, Model } from 'mongoose';

// Avoids ambiguous characters that users often confuse in support tickets and manual entry.
const RANDOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const KNOWN_MODEL_NAMES = [
    'Animal',
    'AnimalGroup',
    'Asset',
    'AuditLog',
    'Batch',
    'BatchAsset',
    'Category',
    'Certification',
    'ConfirmationCode',
    'Crop',
    'Event',
    'Exporter',
    'ExporterUser',
    'Inspection',
    'Inspector',
    'InspectorUser',
    'Location',
    'PasswordReset',
    'Producer',
    'ProducerUser',
    'Product',
    'QrTrace',
    'Regulator',
    'RegulatorUser',
    'Role',
    'Session',
    'Shipment',
    'ShipmentBatch',
    'User'
];

const normalizeModelName = (modelName: string): string =>
    modelName.toLowerCase().replace(/[^a-z0-9]/g, '');

const splitModelName = (modelName: string): string[] =>
    modelName
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+|\s+/)
        .map((segment) => segment.trim().toLowerCase())
        .filter(Boolean);

const getWordAwarePrefix = (modelName: string, firstWordLength: number): string => {
    const words = splitModelName(modelName);

    if (words.length === 0) {
        return 'MD';
    }

    const [firstWord, ...otherWords] = words;
    const basePrefix = firstWord.slice(0, Math.max(2, firstWordLength));
    const suffix = otherWords.map((word) => word.charAt(0)).join('');

    return `${basePrefix}${suffix}`.toUpperCase();
};

export const buildModelPrefixMap = (modelNames: string[]): Record<string, string> => {
    const uniqueModelNames = Array.from(new Set(modelNames.filter(Boolean)));
    const firstWordLengths: Record<string, number> = {};

    uniqueModelNames.forEach((modelName) => {
        firstWordLengths[modelName] = 2;
    });

    let hasCollision = true;

    while (hasCollision) {
        hasCollision = false;
        const groupedByPrefix: Record<string, string[]> = {};

        uniqueModelNames.forEach((modelName) => {
            const prefix = getWordAwarePrefix(modelName, firstWordLengths[modelName]);
            groupedByPrefix[prefix] = groupedByPrefix[prefix] || [];
            groupedByPrefix[prefix].push(modelName);
        });

        Object.values(groupedByPrefix).forEach((group) => {
            if (group.length > 1) {
                hasCollision = true;
                const sortedGroup = [...group].sort((left, right) =>
                    normalizeModelName(left).localeCompare(normalizeModelName(right))
                );

                sortedGroup.slice(1).forEach((modelName) => {
                    firstWordLengths[modelName] += 1;
                });
            }
        });
    }

    const modelPrefixMap: Record<string, string> = {};

    uniqueModelNames.forEach((modelName) => {
        modelPrefixMap[modelName] = getWordAwarePrefix(modelName, firstWordLengths[modelName]);
    });

    return modelPrefixMap;
};

let cachedPrefixMap: Record<string, string> | null = null;
const runtimeModelNames = new Set<string>(KNOWN_MODEL_NAMES);

export const getModelPrefix = (modelName: string): string => {
    runtimeModelNames.add(modelName);

    if (!cachedPrefixMap || !cachedPrefixMap[modelName]) {
        cachedPrefixMap = buildModelPrefixMap(Array.from(runtimeModelNames));
    }

    return cachedPrefixMap[modelName];
};

export const generatePublicId = (modelName: string, randomLength = 10): string => {
    const generateSuffix = customAlphabet(RANDOM_ALPHABET, randomLength);
    return `${getModelPrefix(modelName)}-${generateSuffix()}`;
};

export const generateUniquePublicId = async <T extends Document>(
    model: Model<T>,
    modelName: string,
    fieldName = 'id',
    randomLength = 10
): Promise<string> => {
    const maxAttempts = 20;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const publicId = generatePublicId(modelName, randomLength);
        const exists = await model.exists({ [fieldName]: publicId } as any);

        if (!exists) {
            return publicId;
        }
    }

    throw new Error(`Failed to generate a unique public ID for ${modelName}`);
};
