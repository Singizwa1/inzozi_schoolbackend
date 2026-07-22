'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schoolProfiles', {
      id: {
         type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      schoolId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      mission: { type: Sequelize.TEXT, allowNull: true },
      vision: { type: Sequelize.TEXT, allowNull: true },
      foundedYear: { type: Sequelize.INTEGER, allowNull: true },
      accreditation: { type: Sequelize.STRING, allowNull: true },
      languagesOffered: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      extracurriculars: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      profilePhoto: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('schoolProfiles', ['schoolId']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('schoolProfiles');
  },
};
