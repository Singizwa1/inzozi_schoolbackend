'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('ALTER TYPE "enum_schools_schoolLevel" RENAME TO "enum_schools_schoolLevel_old";');
    await queryInterface.sequelize.query(`CREATE TYPE "enum_schools_schoolLevel" AS ENUM('Nursery', 'Primary', 'O-level', 'A-level');`);
    await queryInterface.sequelize.query(`
      ALTER TABLE "schools"
      ALTER COLUMN "schoolLevel" TYPE "enum_schools_schoolLevel"
      USING (
        CASE "schoolLevel"::text
          WHEN 'O-Level' THEN 'O-level'
          WHEN 'A-Level' THEN 'A-level'
          ELSE "schoolLevel"::text
        END
      )::"enum_schools_schoolLevel";
    `);
    await queryInterface.sequelize.query('DROP TYPE "enum_schools_schoolLevel_old";');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TYPE "enum_schools_schoolLevel" RENAME TO "enum_schools_schoolLevel_new";');
    await queryInterface.sequelize.query(`CREATE TYPE "enum_schools_schoolLevel" AS ENUM('Nursery', 'Primary', 'O-Level', 'A-Level');`);
    await queryInterface.sequelize.query(`
      ALTER TABLE "schools"
      ALTER COLUMN "schoolLevel" TYPE "enum_schools_schoolLevel"
      USING (
        CASE "schoolLevel"::text
          WHEN 'O-level' THEN 'O-Level'
          WHEN 'A-level' THEN 'A-Level'
          ELSE "schoolLevel"::text
        END
      )::"enum_schools_schoolLevel";
    `);
    await queryInterface.sequelize.query('DROP TYPE "enum_schools_schoolLevel_new";');
  },
};
