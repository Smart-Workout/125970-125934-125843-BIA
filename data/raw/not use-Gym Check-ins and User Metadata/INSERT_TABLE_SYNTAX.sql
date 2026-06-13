INSERT INTO trainers(trainer_id,trainer_name,email_id,join_date,salary)
VALUES
        ('001','Santhosh Kumar','santhoshdesi69@gmail.com','27-05-2024','18000'),
        ('002','Manjunath Hegde','manjunathhegde89@gmail.com','09-06-2024','16000'),
        ('003','Joseph Marker','josephmarker45@gmail.com','15-06-2024','16000'),
        ('004','Jaali Mani','jaaliyella098@gmail.com','17-06-2024','17000'),
        ('005','Chetan Gowda','chetugowda454@gmail.com','22-06-2024','19000')



INSERT INTO memberships(membership_id,plans_,price)
VALUES
        ('1','1 Day',150),
	('2','1 Month',1500),
	('3','3 Months',3500),
	('4','6 Months',6000),
	('5','1 Year',9000)



INSERT INTO members(member_id,first_name,last_name,weight,height,gender,trainer_id,membership_id,start_date,end_date)
VALUES
	('0001','Kathy','Mcgregor','46kg','5.1 feet','female','001','5','06-08-2024','06-08-2025'),
	('0002','Kendrick','Lamar','73kg','5.4 feet','male','003','4','06-08-2024','06-02-2025'),
        ('0003','John','parkinson','101kg','4.9 feet','male','005','4','06-08-2024','06-02-2025'),
	('0004','Drake','Drizzy','85kg','5.10 feet','male','002','3','06-08-2024','09-11-2024'),
	('0005','Travis','Scott','72kg','5.9 feet','male','004','1','06-08-2024','06-09-2024')



INSERT INTO member_info(member_id,phone_no,email_id,branch)
VALUES
	('0001',7856349012,'kathymcgregor121@gmail.com','Vijayanagar 4th stage'),
	('0002',9867564534,'kendricklamar821@gmail.com','Vijayanagar 4th stage'),
        ('0003',7845784834,'johnparkinson878@gmail.com','Vijayanagar 4th stage'),
	('0004',9867452312,'drakenba123121@gmail.com','Vijayanagar 4th stage'),
	('0005',7896453212,'cactusjack@gmail.com','Vijayanagar 4th stage');



INSERT INTO transactions(transaction_id,first_name,last_name,member_id,amount_paid,membership_id,transaction_date)
VALUES
        ('01','Kathy','Mcgregor','1','9000','5','06-08-2024'),
	('02','Kendrick','Lamar','2','6000','4','06-08-2024'),
        ('03','John','Parkinson','3','6000','4','06-08-2024'),
	('04','Drake','Drizzy','4','3000','3','06-08-2024'),
	('05','Travis','Scott','5','150','1','06-08-2024');




