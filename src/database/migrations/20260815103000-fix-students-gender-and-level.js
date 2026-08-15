'use strict';

/**
 * The original students migration had a duplicate `gender:` key in the same
 * object literal - JS silently kept only the last one, so the `gender`
 * column ended up with the wrong enum values (school levels instead of
 * MALE/FEMALE/OTHER), and the `level` column was never created at all.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'gender');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_gender";');
    await queryInterface.addColumn('students', 'gender', {
      type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: false,
    });

    await queryInterface.addColumn('students', 'level', {
      type: Sequelize.ENUM('Nursery', 'Primary', 'O-level', 'A-level'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'level');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_level";');

    await queryInterface.removeColumn('students', 'gender');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_gender";');
    await queryInterface.addColumn('students', 'gender', {
      type: Sequelize.ENUM('Nursery', 'Primary', 'O-level', 'A-level'),
      allowNull: false,
    });
  },
};
