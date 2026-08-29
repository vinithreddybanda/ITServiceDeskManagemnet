GO
IF EXISTS(SELECT * FROM sys.tables WHERE SCHEMA_NAME(schema_id) LIKE 'dbo' AND name like 'Registrations')  
   DROP TABLE [dbo].[Registrations];  
GO
IF EXISTS(SELECT * FROM sys.tables WHERE SCHEMA_NAME(schema_id) LIKE 'dbo' AND name like 'Trainings')  
   DROP TABLE [dbo].[Trainings]; 
GO
IF EXISTS(SELECT * FROM sys.tables WHERE SCHEMA_NAME(schema_id) LIKE 'dbo' AND name like 'Candidates')  
   DROP TABLE [dbo].[Candidates]; 
GO

CREATE TABLE [dbo].[Candidates](
	[FirstName] [varchar](20) NOT NULL,
	[LastName] [varchar](20) NOT NULL,
	[EmailAddress] [varchar](20) NOT NULL,
	[Password] [varchar](20) NOT NULL,
 CONSTRAINT [PK_Candidates] PRIMARY KEY CLUSTERED 
(
	[EmailAddress] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Trainings](
	[TrainingId] [int] IDENTITY(1,1) NOT NULL,
	[TrainingName] [varchar](30) NOT NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NOT NULL,
	[Fees] [numeric](7, 2) NULL,
 CONSTRAINT [PK_Trainings] PRIMARY KEY CLUSTERED 
(
	[TrainingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Registrations](
	[RegistrationId] [int] IDENTITY(1,1) NOT NULL,
	[TrainingId] [int] NOT NULL,
	[EmailAddress] [varchar](20) NOT NULL,
	[FeesPaid] [numeric](7, 2) NULL,
	[Status] [varchar](20) NULL,
 CONSTRAINT [PK_Registrations] PRIMARY KEY CLUSTERED 
(
	[RegistrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE Registrations
ADD CONSTRAINT FK_TrainingId FOREIGN KEY(TrainingId)
REFERENCES Trainings(TrainingId)
ALTER TABLE Registrations
ADD CONSTRAINT FK_EmailId FOREIGN KEY(EmailAddress)
REFERENCES Candidates(EmailAddress)

INSERT INTO [dbo].[Trainings] ([TrainingName], [StartDate], [EndDate], [Fees]) VALUES ('DevOps', '12/12/2020', '12/15/2020', 5000)
 INSERT INTO [dbo].[Trainings] ([TrainingName], [StartDate], [EndDate], [Fees]) VALUES ('Agile', '12/12/2020', '12/15/2020', 5000)
 INSERT INTO [dbo].[Trainings] ([TrainingName], [StartDate], [EndDate], [Fees]) VALUES ('Cloud Computing', '12/12/2020', '12/15/2020', 5000)
 INSERT INTO [dbo].[Trainings] ([TrainingName], [StartDate], [EndDate], [Fees]) VALUES ('DevOps Tools', '12/12/2020', '12/15/2020', 5000)
 INSERT INTO [dbo].[Trainings] ([TrainingName], [StartDate], [EndDate], [Fees]) VALUES ('Automation', '12/12/2020', '12/15/2020', 5000)