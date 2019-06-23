import Sequelize from "sequelize";

export default class ProductionModel extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
			// attributes
			inverterid: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: "compositeIndex"
			},
			datetime: {
				type: Sequelize.DATE,
				allowNull: false,
				unique: "compositeIndex"
			},
			v: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			kw: {
				type: Sequelize.DECIMAL(7,3),
				allowNull: false
			}
		}, {
			// options
			sequelize,
			modelName: "production",
			freezeTableName: true
		});
	}
}