'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Comments',
      Array.from({ length: 10 }).map((d, i) => ({
        id: i + 1,
        text: faker.lorem.text().substring(0, 50),
        RestaurantId: Math.floor(Math.random() * 30) + 1,
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
