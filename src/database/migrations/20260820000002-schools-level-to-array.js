'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "schools"
      ALTER COLUMN "schoolLevel" TYPE "enum_schools_schoolLevel"[]
      USING (
        CASE WHEN "schoolLevel" IS NULL THEN NULL ELSE ARRAY["schoolLevel"] END
      );
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "schools"
      ALTER COLUMN "schoolLevel" TYPE "enum_schools_schoolLevel"
      USING ("schoolLevel"[1]);
    `);
  },
};
