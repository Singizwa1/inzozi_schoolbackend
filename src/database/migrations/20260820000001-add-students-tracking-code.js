'use strict';

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O/1/I/L - avoids visual confusion

function generateCode() {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'trackingCode', {
      type: Sequelize.STRING(8),
      allowNull: true,
    });

    // Backfill any existing rows with a unique code before enforcing NOT NULL.
    const [existing] = await queryInterface.sequelize.query('SELECT id FROM students;');
    const used = new Set();
    for (const row of existing) {
      let code = generateCode();
      while (used.has(code)) {code = generateCode();}
      used.add(code);
      await queryInterface.sequelize.query(
        'UPDATE students SET "trackingCode" = :code WHERE id = :id',
        { replacements: { code, id: row.id } }
      );
    }

    await queryInterface.changeColumn('students', 'trackingCode', {
      type: Sequelize.STRING(8),
      allowNull: false,
    });
    await queryInterface.addIndex('students', ['trackingCode'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('students', ['trackingCode']);
    await queryInterface.removeColumn('students', 'trackingCode');
  },
};
