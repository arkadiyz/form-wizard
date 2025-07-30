-- ================================================
-- BACKUP SCRIPT - Run this BEFORE CreateTables.sql
-- This creates a backup of existing data
-- ================================================

USE form_wizard_db;
GO

-- Backup existing data if tables exist
IF EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    SELECT * INTO Users_Backup_20250728 FROM Users;
    PRINT 'Users table backed up to Users_Backup_20250728';
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
BEGIN
    SELECT * INTO Categories_Backup_20250728 FROM Categories;
    PRINT 'Categories table backed up to Categories_Backup_20250728';
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
BEGIN
    SELECT * INTO Roles_Backup_20250728 FROM Roles;
    PRINT 'Roles table backed up to Roles_Backup_20250728';
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='Locations' AND xtype='U')
BEGIN
    SELECT * INTO Locations_Backup_20250728 FROM Locations;
    PRINT 'Locations table backed up to Locations_Backup_20250728';
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='Skills' AND xtype='U')
BEGIN
    SELECT * INTO Skills_Backup_20250728 FROM Skills;
    PRINT 'Skills table backed up to Skills_Backup_20250728';
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='SkillsCategories' AND xtype='U')
BEGIN
    SELECT * INTO SkillsCategories_Backup_20250728 FROM SkillsCategories;
    PRINT 'SkillsCategories table backed up to SkillsCategories_Backup_20250728';
END

PRINT 'Backup completed successfully!';
PRINT 'You can now safely run CreateTables.sql';