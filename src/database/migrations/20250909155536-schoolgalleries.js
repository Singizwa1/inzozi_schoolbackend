'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schoolgalleries', {
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
      imageUrl: { type: Sequelize.STRING, allowNull: false },
      category: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      caption: { type: Sequelize.STRING, allowNull: true },
      isFeatured: { type: Sequelize.BOOLEAN, defaultValue: false },
      order: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('schoolgalleries', ['schoolId']);
    await queryInterface.addIndex('schoolgalleries', ['category']);
    await queryInterface.addIndex('schoolgalleries', ['isFeatured']);
    await queryInterface.addIndex('schoolgalleries', ['schoolId', 'order']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('schoolgalleries');
  },
};
