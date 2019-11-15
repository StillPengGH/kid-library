const { Sequelize, Model } = require('sequelize');
const { sequelize } = require('../../core/db');

/**
 * 期刊Model
 */
class FlowModel extends Model {

}

FlowModel.init({
  index:Sequelize.INTEGER,
  lib_id:Sequelize.INTEGER,
  type:Sequelize.INTEGER
}, {
  sequelize,
  tableName: 'flow'
})

module.exports = {
  FlowModel
}