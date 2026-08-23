'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('translation_cache', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      // sha256 of `${targetLang}:${sourceText}` - keeps the unique index small
      // regardless of how long the source text is.
      sourceHash: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      targetLang: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      sourceText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      translatedText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('translation_cache', ['sourceHash', 'targetLang'], {
      unique: true,
      name: 'translation_cache_hash_lang_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('translation_cache');
  },
};
