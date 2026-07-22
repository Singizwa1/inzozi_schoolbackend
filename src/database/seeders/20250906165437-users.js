const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordSchoolManager = await bcrypt.hash('school123', 10);
    const passwordAdmissionManager = await bcrypt.hash('admission123', 10);

    // Fetch role IDs from roles table
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles;'
    );
    const adminRoleId = roles.find(r => r.name === 'Admin').id;
    const schoolManagerRoleId = roles.find(r => r.name === 'SchoolManager').id;
    const admissionManagerRoleId = roles.find(r => r.name === 'AdmissionManager').id;

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        firstName: 'System',
        lastName: 'Admin',
        gender: 'Male',
        district: 'Kigali',
        email: 'singizwaserge@gmail.com',
        password: passwordAdmin,
        roleId: adminRoleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: 'School',
        lastName: 'Manager',
        gender: 'Female',
        district: 'Kigali',
        email: 'clebertsabinganza@gmail.com',
        password: passwordSchoolManager,
        roleId: schoolManagerRoleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: 'Admission',
        lastName: 'Manager',
        gender: 'Other',
        district: 'Kigali',
        email: 'admissionmanager@example.com',
        password: passwordAdmissionManager,
        roleId: admissionManagerRoleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
