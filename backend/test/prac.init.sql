-- Создание базы данных и пользователя
CREATE DATABASE nest_project;
CREATE USER nest_user WITH PASSWORD 'nest_user';
GRANT ALL PRIVILEGES ON DATABASE nest_project TO nest_user;

-- Подключение к базе данных
\c nest_project

-- Создание таблицы films
CREATE TABLE films (
  id VARCHAR PRIMARY KEY,
  rating NUMERIC NOT NULL,
  director VARCHAR NOT NULL,
  tags TEXT[] NOT NULL,
  image VARCHAR NOT NULL,
  cover VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  about TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Создание таблицы schedule
CREATE TABLE schedule (
  id VARCHAR PRIMARY KEY,
  daytime VARCHAR NOT NULL,
  hall INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  taken TEXT[] DEFAULT '{}',
  film_id VARCHAR NOT NULL,
  CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);

-- Создание индекса для быстрого поиска расписания по фильму
CREATE INDEX idx_schedule_film_id ON schedule(film_id);

-- Выдача прав пользователю nest_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nest_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nest_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nest_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nest_user;
GRANT ALL ON SCHEMA public TO nest_user;