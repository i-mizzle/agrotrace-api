export const accountPermissionsList = {
    sections: [      
      {
        title: 'Full business Management',
        permissions: [
          {
            label: `All actions in the context of this business. Selecting this permission means the any user with this role has no limits in this business and you don't need to select any other permissions below`,
            value: 'business.*',
            selected: false
          }
        ]
      },
      {
        title: 'Audit logs',
        permissions: [
          {
            label: 'All audit logs actions',
            value: 'business.audit-logs.*',
            selected: false
          },
          {
            label: 'See all audit logs',
            value: 'business.audit-logs.read',
            selected: false
          },
        ]
      },       
      {
        title: 'Menus',
        permissions: [
          {
            label: 'All menus actions',
            value: 'business.menus.*',
            selected: false
          },
          {
            label: 'Create menus',
            value: 'business.menus.create',
            selected: false
          },
          {
            label: 'See all menus',
            value: 'business.menus.read',
            selected: false
          },
          {
            label: 'Update menus',
            value: 'business.menus.update',
            selected: false
          },
          {
            label: 'Delete menus',
            value: 'business.menus.delete',
            selected: false
          },
        ]
      },
      {
        title: 'Orders',
        permissions: [
          {
            label: 'All orders actions',
            value: 'business.orders.*',
            selected: false
          },
          {
            label: 'Create orders items',
            value: 'business.orders.create',
            selected: false
          },
          {
            label: 'List all orders items',
            value: 'business.orders.read',
            selected: false
          },
          {
            label: 'Update orders',
            value: 'business.orders.update',
            selected: false
          },
          {
            label: 'Approve orders updates',
            value: 'business.orders.approvals',
            selected: false
          },
          {
            label: 'Delete orders',
            value: 'business.orders.delete',
            selected: false
          },
        ]
      },
      {
        title: 'Payments',
        permissions: [
          {
            label: 'All payments actions',
            value: 'business.payments.*',
            selected: false
          },
          {
            label: 'Create payments',
            value: 'business.payments.create',
            selected: false
          },
          {
            label: 'Read all payments',
            value: 'business.payments.read',
            selected: false
          },
          {
            label: 'Update payments',
            value: 'business.payments.update',
            selected: false
          },
          {
            label: 'Delete payments',
            value: 'business.payments.delete',
            selected: false
          },
        ]
      },
      {
        title: 'Reports',
        permissions: [
          {
            label: 'All business reports',
            value: 'business.reports.*',
            selected: false
          },
          {
            label: 'Tables reports',
            value: 'business.reports.tables',
            selected: false
          },
          {
            label: 'Financial reports',
            value: 'business.reports.financial',
            selected: false
          },
          {
            label: 'Orders reports',
            value: 'business.reports.orders',
            selected: false
          },
        ]
      },
      {
        title: 'Roles',
        permissions: [
          {
            label: 'All roles actions',
            value: 'business.roles.*',
            selected: false
          },
          {
            label: 'Create roles',
            value: 'business.roles.create',
            selected: false
          },
          {
            label: 'Read all roles',
            value: 'business.roles.read',
            selected: false
          },
          {
            label: 'Update roles',
            value: 'business.roles.update',
            selected: false
          },
          {
            label: 'Delete roles',
            value: 'business.roles.delete',
            selected: false
          },
        ]
      },
      {
        title: 'Tables',
        permissions: [
          {
            label: 'All tables actions',
            value: 'business.tables.*',
            selected: false
          },
          {
            label: 'Create tables',
            value: 'business.tables.create',
            selected: false
          },
          {
            label: 'List all tables',
            value: 'business.tables.read',
            selected: false
          },
          {
            label: 'Update tables',
            value: 'business.tables.update',
            selected: false
          },
          {
            label: 'Delete tables',
            value: 'business.tables.delete',
            selected: false
          },
        ]
      },
      {
        title: 'Users',
        permissions: [
          {
            label: 'All user actions',
            value: 'business.users.*',
            selected: false
          },
          {
            label: 'Create user',
            value: 'business.users.create',
            selected: false
          },
          {
            label: 'Read all user',
            value: 'staff.read',
            selected: false
          },
          {
            label: 'Update users',
            value: 'business.users.update',
            selected: false
          },
          {
            label: 'Delete users',
            value: 'business.users.delete',
            selected: false
          },
        ]
      }

    ]
  }