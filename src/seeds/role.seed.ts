import log from "../logger";
import Role from "../model/role.model";

export const seedRoles = async () => {
    // Check if the permissions collection is empty
    const count = await Role.countDocuments();

    if (count === 0) {
        // Seed roles if the collection is empty
        const newRoles = [
            {
                name: "System administrator",
                slug: "system-administrator",
                type: "super-admin",
                description: "This role can do all things",
                permissions: ["*"],
                deleted: false
            },
            {
                name: "Business owner",
                slug: "business-owner",
                type: "user",
                description: "This role can do all things within the context of a business",
                permissions: ["business.*"],
                deleted: false
            }
        ]

        await Role.insertMany(newRoles);
        log.info('Roles seeded successfully.');
    } else {
        log.info('Roles already seeded.');
    }
}