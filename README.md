# 🚀 Project Ambience 

## Environment Variables

Create a `.env` file in your project root:

```env
RAILS_MASTER_KEY=your-rails-master-key
```

Ask Saruj for "your-rails-master-key"

---

## Run in local (with docker)

```
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml exec web bin/rails db:create
docker-compose -f docker-compose.dev.yml exec web bin/rails db:migrate
docker-compose -f docker-compose.dev.yml exec web bin/rails db:seed
```
The app will available at port 3000

---

## Run in local (without docker)

Make sure you have Ruby and postgres run in background

```
bin/rails db:create
bin/rails db:migrate
bin/rails s
```
---

## Deployment - Gaudi

```
docker compose up --build -d
docker compose exec web ./bin/rails db:create
docker compose exec web ./bin/rails db:migrate
```

The app will available at port 5090