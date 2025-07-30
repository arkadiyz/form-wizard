-- ================================================
-- FormWizard Database Schema - Phase 2
-- All column names start with lowercase letter
-- ================================================

USE form_wizard_db;
GO

-- 1. Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        firstName NVARCHAR(50) NOT NULL,
        lastName NVARCHAR(50) NOT NULL,
        phone NVARCHAR(20) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        updatedAt DATETIME2 DEFAULT GETUTCDATE()
    );
    
    CREATE INDEX IX_Users_Email ON Users(email);
    CREATE INDEX IX_Users_Phone ON Users(phone);
END
GO

-- 2. SkillsCategories Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SkillsCategories' AND xtype='U')
BEGIN
    CREATE TABLE SkillsCategories (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL,
        createdAt DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- 3. Skills Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Skills' AND xtype='U')
BEGIN
    CREATE TABLE Skills (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        categoryId UNIQUEIDENTIFIER NOT NULL,
        name NVARCHAR(200) NOT NULL,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (categoryId) REFERENCES SkillsCategories(id)
    );
    
    CREATE INDEX IX_Skills_CategoryId ON Skills(categoryId);
END
GO

-- 4. Locations Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Locations' AND xtype='U')
BEGIN
    CREATE TABLE Locations (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL UNIQUE,
        createdAt DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- 5. Categories Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
BEGIN
    CREATE TABLE Categories (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL UNIQUE,
        createdAt DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- 6. Roles Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
BEGIN
    CREATE TABLE Roles (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        categoryId UNIQUEIDENTIFIER NOT NULL,
        name NVARCHAR(100) NOT NULL,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (categoryId) REFERENCES Categories(id)
    );
    
    CREATE INDEX IX_Roles_CategoryId ON Roles(categoryId);
END
GO

-- 7. UserNotifications Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserNotifications' AND xtype='U')
BEGIN
    CREATE TABLE UserNotifications (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        userId UNIQUEIDENTIFIER NOT NULL,
        isEmailEnabled BIT DEFAULT 1,
        isPhoneEnabled BIT DEFAULT 0,
        isCallEnabled BIT DEFAULT 0,
        isSmsEnabled BIT DEFAULT 0,
        isWhatsappEnabled BIT DEFAULT 0,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        updatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    
    CREATE INDEX IX_UserNotifications_UserId ON UserNotifications(userId);
END
GO

PRINT 'Database schema created successfully with lowercase column names!';