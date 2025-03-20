import { Sequelize } from "sequelize";
import db from '../configs/mysql.js'

const { DataTypes } = Sequelize;

const Users = db.define('users', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    identity_file: DataTypes.STRING,
    refresh_token: DataTypes.TEXT
}, {
    freezeTableName: true
})

export default Users;
