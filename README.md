# 🚀 Project Ambience 

## Environment Variables

Create a `.env` file in your project root:

```
RAILS_MASTER_KEY=
MODEL_INSTALLER_SERVICE_PATH=
MODEL_INSTALL_REQUEST_CALLBACK_PATH=
```

Ask William or Saruj for "your-rails-master-key"

---

## Run in local (with docker)

```
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml exec api bin/rails db:migrate
docker-compose -f docker-compose.dev.yml exec api bin/rails db:seed
```
The app will available at port 3000

---

## Deployment - Gaudi

```
docker compose up --build -d
docker compose exec api ./bin/rails db:migrate
docker compose exec api ./bin/rails db:seed
```

The app will available at port 5090
