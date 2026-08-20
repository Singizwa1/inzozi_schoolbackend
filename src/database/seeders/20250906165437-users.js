const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const SCHOOL_MANAGER_EMAIL = process.env.SEED_SCHOOL_MANAGER_EMAIL;
const SCHOOL_MANAGER_PASSWORD = process.env.SEED_SCHOOL_MANAGER_PASSWORD;
const ADMISSION_MANAGER_EMAIL = 'admissionmanager@example.com';

module.exports = {
  
  async up(queryInterface, Sequelize) {
    const missing = ['SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD', 'SEED_SCHOOL_MANAGER_EMAIL', 'SEED_SCHOOL_MANAGER_PASSWORD']
      .filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing required env vars for seeding: ${missing.join(', ')} (see .env.example)`);
    }

    const [existing] = await queryInterface.sequelize.query('SELECT email FROM users;');
    const existingEmails = new Set(existing.map((u) => u.email));

    const [roles] = await queryInterface.sequelize.query('SELECT id, name FROM roles;');
    const adminRoleId = roles.find(r => r.name === 'Admin').id;
    const schoolManagerRoleId = roles.find(r => r.name === 'SchoolManager').id;
    const admissionManagerRoleId = roles.find(r => r.name === 'AdmissionManager').id;

    const candidates = [
      {
        firstName: 'System',
        lastName: 'Admin',
        gender: 'Male',
        district: 'Kigali',
        email: ADMIN_EMAIL,
        plainPassword: ADMIN_PASSWORD,
        roleId: adminRoleId,
      },
      {
        firstName: 'School',
        lastName: 'Manager',
        gender: 'Female',
        district: 'Kigali',
        email: SCHOOL_MANAGER_EMAIL,
        plainPassword: SCHOOL_MANAGER_PASSWORD,
        roleId: schoolManagerRoleId,
      },
      {
        firstName: 'Admission',
        lastName: 'Manager',
        gender: 'Other',
        district: 'Kigali',
        email: ADMISSION_MANAGER_EMAIL,
        plainPassword: 'admission123',
        roleId: admissionManagerRoleId,
      },
    ].filter((c) => !existingEmails.has(c.email));

    if (!candidates.length) {return;}

    const toInsert = await Promise.all(
      candidates.map(async function (c) {
        return {
          id: uuidv4(),
          firstName: c.firstName,
          lastName: c.lastName,
          gender: c.gender,
          district: c.district,
          email: c.email,
          password: await bcrypt.hash(c.plainPassword, 10),
          roleId: c.roleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
    );

    await queryInterface.bulkInsert('users', toInsert);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: [ADMIN_EMAIL, SCHOOL_MANAGER_EMAIL, ADMISSION_MANAGER_EMAIL].filter(Boolean),
    });
  },
};
