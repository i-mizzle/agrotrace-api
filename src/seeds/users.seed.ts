import log from "../logger";
import Role from "../model/role.model";
import User from "../model/user.model";
import { findRole } from "../service/role.service";
import { createUser } from "../service/user.service";


export const seedUsers = async () => {
    // Check if the user collection is empty
    const count = await User.countDocuments();
    const rolesCount = await Role.countDocuments();
    
    if (count === 0 && rolesCount > 0) {
        const role = await findRole({slug: 'system-administrator'})
        // Seed user if the collection is empty
        const superAdmin = {
            emailConfirmed: true,
            userType: "super-administrator",
            email: "super-admin@scanserve.cloud",
            username: "sys-admin",
            name: "Super Administrator",
            passwordChanged: true,
            phone: '08012345678',
            adminRoles: role ? [role._id] : [],
            password: process.env.SEED_SYS_ADMIN_PW as string
        }

        await createUser(superAdmin);
        log.info('Users seeded successfully.');
    } else {
        log.info('User(s) already seeded.');
    }
}