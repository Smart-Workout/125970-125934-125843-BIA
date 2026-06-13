CREATE TABLE trainers(
	trainer_id CHAR(10) PRIMARY KEY,
	trainer_name VARCHAR(50) NOT NULL,
	email_id VARCHAR(50) NOT NULL UNIQUE,
	join_date date NOT NULL,
	salary decimal (7) NOT NULL
	);


CREATE TABLE memberships(
	membership_id  INT PRIMARY KEY,
	plans_ VARCHAR(50) NOT NULL,
	price INT NOT NULL
	 );


CREATE TABLE members(
	member_id INT PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	weight CHAR(10) NOT NULL,
	height CHAR(10) NOT NULL,
	gender CHAR(10) NOT NULL,
	trainer_id CHAR(10),
	membership_id int,
	start_date date NOT NULL,
	end_date date NOT NULL,
	FOREIGN KEY (trainer_id)
	REFERENCES trainers(trainer_id),
	FOREIGN KEY (membership_id)
	REFERENCES memberships(membership_id)
	);
 

CREATE TABLE member_info(
	member_id INT,
	phone_no VARCHAR(50) NOT NULL,
	email_id VARCHAR(100) NOT NULL UNIQUE,
	branch VARCHAR(50) NOT NULL,
	FOREIGN KEY (member_id)
	REFERENCES  members(member_id)
);


CREATE TABLE transactions(
	transaction_id INT PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	member_id INT NOT NULL,
	amount_paid INT NOT NULL,
	membership_id INT NOT NULL,
        transaction_date date NOT NULL
);