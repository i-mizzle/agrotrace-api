import { object, string, ref, number, boolean, array } from "yup";

export const createAssetSchema = object({
    body: object({
        name: string().required('name is required'),
        // assetCode: string().required('asset code is required'),
        type: string().required('type is required').oneOf(['crop', 'animal', 'animal-group']),
        // required if type is crop
        crop: object().when('type', {
            is: 'crop',
            then: object({
                species: string().required('species is required'),
                breed: string().required('breed is required'),
                plantingDate: string().required('planting date is required'),
                season: string().oneOf(['wet', 'dry', 'perennial']).required('season is required'),
                expectedHarvestDate: string().required('expected harvest date is required'),
                seedSource: string().required('seed source is required'),
                irrigationSource: string(),
                fertilizersUsed: array().of(string()),
                pesticidesUsed: array().of(string())
            })
        }),
        // required if type is animal
        animal: object().when('type', {
            is: 'animal',
            then: object({
                sex: string().oneOf(['male', 'female']).required('sex is required'),
                dateOfBirth: string().required('date of birth is required'),
                idMethod: string().oneOf(['ear-tag', 'rfid', 'visual', 'none']),
                idNumber: string(),
                origin: string().oneOf(['born-on-farm', 'purchased']).required('origin is required'),
                acquisitionDate: string(),
                weightAtRegistration: string().required('weight at registration is required'),
                species: string().required('species is required'),
                breed: string().required('breed is required')
            })
        }),
        // required if type is animalGroup
        animalGroup: object().when('type', {
            is: 'animal-group',
            then: object({
                size: number().required('size is required'),
                type: string().oneOf(['poultry', 'fish', 'goats', 'cattle', 'others']).required('type is required'),
                species: string().required('species is required'),
                breed: string().required('breed is required'),
                startDate: string().required('start date is required'),
                expectedHarvestDate: string().required('expected harvest date is required')
            })
        })
    })
});

const params = {
    params: object({
        assetId: string().required('asset id is required as a path param')
    })
}

export const getAssetSchema = object({
    ...params
})
