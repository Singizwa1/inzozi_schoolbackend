'use strict';

/**
 * Student previously had no link back to the SchoolSpot it applied for,
 * which made it impossible to correctly track/decrement spot occupancy.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'schoolSpotId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'schoolspots', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addIndex('students', ['schoolSpotId']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('students', ['schoolSpotId']);
    await queryInterface.removeColumn('students', 'schoolSpotId');
  },
};
