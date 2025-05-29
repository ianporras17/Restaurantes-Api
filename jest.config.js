export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  silent: true,  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/app.js',
    'src/index.js',
    'src/db/index.js',
    'src/utils/retryConnection.js',

    'src/modules/menus/dao/menus.mongo.js',
    'src/modules/menus/dao/menus.pg.js',
    'src/modules/menus/dao/index.js',
    'src/modules/menus/menus.model.js',
    'src/modules/menus/menus.mongo.model.js',

    'src/modules/orders/dao/orders.mongo.js',
    'src/modules/orders/dao/orders.pg.js',
    'src/modules/orders/dao/index.js',
    'src/modules/orders/orders.model.js',
    'src/modules/orders/orders.mongo.model.js',

    'src/modules/reservations/dao/reservations.mongo.js',
    'src/modules/reservations/dao/reservations.pg.js',
    'src/modules/reservations/dao/index.js',
    'src/modules/reservations/reservations.model.js',
    'src/modules/reservations/reservations.mongo.model.js',

    'src/modules/restaurants/dao/restaurants.mongo.js',
    'src/modules/restaurants/dao/restaurants.pg.js',
    'src/modules/restaurants/dao/index.js',
    'src/modules/restaurants/restaurants.model.js',
    'src/modules/restaurants/restaurants.mongo.model.js',

    'src/modules/users/dao/users.mongo.js',
    'src/modules/users/dao/users.pg.js',
    'src/modules/users/dao/index.js',
    'src/modules/users/users.model.js',
    'src/modules/users/users.mongo.model.js',

    'src/utils/mongoId.js',

    'src/search/index.js',
    'src/search/elastic.config.js',
    'src/search/controller.js',
    'src/search/router.js',
    'src/utils/cache.js',
    'src/utils/indexers.js',
    'src/utils/esClient.js'


  ],
};
