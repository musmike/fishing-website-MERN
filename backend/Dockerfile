FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure .env exists from .env.example if missing
RUN if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; fi

EXPOSE 5000

CMD ["sh", "-c", "if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; fi && npm run dev"]
