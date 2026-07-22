'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
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
      firstName: { type: Sequelize.STRING, allowNull: false },
      middleName: { type: Sequelize.STRING, allowNull: true },
      lastName: { type: Sequelize.STRING, allowNull: false },
      gender: { type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: false },
      gender: { type: Sequelize.ENUM('Nursery' , 'Primary' ,'O-level' , 'A-level'), allowNull: false },
      DOB: { type: Sequelize.DATEONLY, allowNull: false },
      indexNumber: { type: Sequelize.STRING, allowNull: true, unique: true },
      studentType: { type: Sequelize.ENUM('newcomer', 'transfer'), allowNull: false },
      resultSlip: { type: Sequelize.STRING, allowNull: true },
      yearOfStudy:{ type: Sequelize.STRING, allowNull: true },
      previousReport: { type: Sequelize.STRING, allowNull: true },
      mitationLetter: { type: Sequelize.STRING, allowNull: true },
      passportPhoto: { type: Sequelize.STRING, allowNull: false },
      fathersNames: { type: Sequelize.STRING, allowNull: false },
      mothersNames: { type: Sequelize.STRING, allowNull: false },
      representerEmail: { type: Sequelize.STRING, allowNull: false },
      representerPhone: { type: Sequelize.STRING, allowNull: false },
      nationality: { type: Sequelize.STRING, allowNull: false },
      province: { type: Sequelize.STRING, allowNull: false },
      district: { type: Sequelize.STRING, allowNull: false },
      sector: { type: Sequelize.STRING, allowNull: false },
      cell: { type: Sequelize.STRING, allowNull: false },
      village: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      babyeyiDocument: { type: Sequelize.STRING, allowNull: true },
      babyeyiIssuedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('students');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_gender";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_studentType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_status";');
  },
};
