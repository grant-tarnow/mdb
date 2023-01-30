DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS relationships;

CREATE TABLE volunteers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT "Chicago",
    usstate TEXT NOT NULL DEFAULT "IL",
    church TEXT,
    location TEXT,
    team TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT "Chicago",
    usstate TEXT NOT NULL DEFAULT "IL",
    church TEXT,
    school TEXT,
    location TEXT,
    team TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    is_graduated INTEGER DEFAULT 0
);

CREATE TABLE relationships (
    mentor_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    stage TEXT DEFAULT "connected",
    PRIMARY KEY(mentor_id, student_id),
    FOREIGN KEY(mentor_id) REFERENCES volunteers(id)
    FOREIGN KEY(student_id) REFERENCES students(id)
);

-- Grab this statement for a fun test
-- SELECT volunteers.fname, students.fname FROM volunteers
-- JOIN relationships ON volunteers.id = relationships.mentor_id
-- JOIN students ON students.id = relationships.student_id
-- WHERE relationships.stage LIKE "life-on-life";