const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AbuseReport = sequelize.define('AbuseReport', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    server_ip: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    email_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    thread_ts: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Slack thread timestamp',
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'open',
    },
}, {
    tableName: 'abuse_reports',
    timestamps: true,
    underscored: true,
});

module.exports = AbuseReport;
