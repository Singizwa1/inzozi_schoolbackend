'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schoolspots', {
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
      level: { 
        type: Sequelize.ENUM('Nursery', 'Primary', 'O-level', 'A-level'), 
        allowNull: false 
      },
      studentType: { 
        type: Sequelize.ENUM('newcomer', 'transfer'), 
        allowNull: false 
      },
      academicYear: { type: Sequelize.STRING, allowNull: false },
      yearofstudy: { type: Sequelize.STRING, allowNull: false },
      totalSpots: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      occupiedSpots: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      registrationOpen: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      waitingListCount: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      combination: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      admissionConditions: { type: Sequelize.JSONB, allowNull: true, defaultValue: {} },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });

  
    await queryInterface.addIndex('schoolspots', ['schoolId']);
    await queryInterface.addIndex('schoolspots', ['academicYear']);
    await queryInterface.addIndex('schoolspots', ['level']);

    
    await queryInterface.addConstraint('schoolspots', {
      fields: ['schoolId', 'academicYear', 'level', 'studentType', 'yearofstudy', 'combination'],
      type: 'unique',
    name: 'unique_school_spot_per_category',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('schoolspots');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_schoolspots_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_schoolspots_studentType";');
  },
};
