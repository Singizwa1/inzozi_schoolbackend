'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schools', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      schoolName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      schoolCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      schoolCategory: {
        type: Sequelize.ENUM('REB', 'RTB'),
        allowNull: true,
      },
      schoolLevel: {
        type: Sequelize.ENUM('Nursery', 'Primary', 'O-Level', 'A-Level'),
        allowNull: true,
      },
      schoolType: {
        type: Sequelize.ENUM('Girls', 'Boys', 'Mixed'),
        allowNull: true,
      },
      province: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cell: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      village: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      telephone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('not_registered','pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rejectedReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      licenseDocument: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('schools', ['schoolCode'], { unique: true });
    await queryInterface.addIndex('schools', ['email'], { unique: true });
    await queryInterface.addIndex('schools', ['status']);
    await queryInterface.addIndex('schools', ['approvedBy']);

  },

  async down(queryInterface) {
    await queryInterface.dropTable('schools');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_schools_schoolCategory";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_schools_schoolLevel";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_schools_schoolType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_schools_status";');
  }
};
