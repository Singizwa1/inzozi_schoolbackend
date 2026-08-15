'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('schools', 'subscriptionStatus', {
      type: Sequelize.ENUM('trial', 'active', 'expired'),
      allowNull: false,
      defaultValue: 'trial',
    });
    await queryInterface.addColumn('schools', 'trialEndsAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('schools', 'currentPeriodEnd', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('schools', 'reminderSentAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('schools', ['subscriptionStatus']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('schools', ['subscriptionStatus']);
    await queryInterface.removeColumn('schools', 'subscriptionStatus');
    await queryInterface.removeColumn('schools', 'trialEndsAt');
    await queryInterface.removeColumn('schools', 'currentPeriodEnd');
    await queryInterface.removeColumn('schools', 'reminderSentAt');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_schools_subscriptionStatus";');
  },
};
