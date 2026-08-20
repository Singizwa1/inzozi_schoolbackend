const { v4: uuidv4 } = require('uuid');

const ROLE_NAMES = ['Admin', 'SchoolManager', 'AdmissionManager'];

module.exports = {
  // There's no seeder-tracking table in this project, so db:seed:all re-runs
  // every seeder on every invocation - only insert roles that don't exist yet.
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query('SELECT name FROM roles;');
    const existingNames = new Set(existing.map((r) => r.name));

    const toInsert = ROLE_NAMES.filter((name) => !existingNames.has(name)).map((name) => ({
      id: uuidv4(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (toInsert.length) {
      await queryInterface.bulkInsert('roles', toInsert);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', { name: ROLE_NAMES });
  },
};
