const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { id: uuidv4(), name: 'Admin', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'SchoolManager', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'AdmissionManager', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
