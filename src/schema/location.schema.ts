import { object, string, ref, number, boolean, array } from "yup";

export const createLocationSchema = object({
    body: object({
        name: string().required('name is required'),
        type: string().oneOf(['farm', 'processing-plant', 'warehouse', 'distribution-center', 'retail-outlet', 'other']).required('type is required'),
        latitude: number(),
        longitude: number(),
        state: string().required('state is required'),
        lga: string().required('lga is required'),
        addressDescription: string().required('addressDescription is required'),
        landSize: number(), // in hectares
        waterSourceType: string().oneOf(['rain-fed', 'borehole', 'well', 'river', 'stream', 'lake', 'dam', 'irrigation-canal', 'municipal-supply', 'harvested-rainwater', 'pond', 'other']),
        soilType: string().oneOf(['sandy', 'loamy', 'silty', 'sandy-loam', 'clay-loam', 'silt-loam', 'peaty', 'chalky', 'laterite', 'organic', 'mixed', 'unknown', 'other']),
    })
});

const params = {
    params: object({
        locationId: string().required('location id is required as a path param')
    })
}

export const getLocationSchema = object({
    ...params
})
