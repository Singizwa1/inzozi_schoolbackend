'use strict';

/**
 * The Student model defines `rejectedReason`, but the original students
 * migration never created the column - only the schools migration did.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'rejectedReason', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('students', 'rejectedReason');
  },
};
