'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Comments',
      Array.from({ length: 10 }).map((d, i) => ({
        text: faker.lorem.text().substring(0, 50),
        RestaurantId: Math.floor(Math.random() * 20) + 1,
        UserId: Math.floor(Math.random() * 2) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
}
