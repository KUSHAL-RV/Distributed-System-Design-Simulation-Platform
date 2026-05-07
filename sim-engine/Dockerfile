# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/sim-engine ./cmd/server/main.go

# Production Stage
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/sim-engine .

EXPOSE 5000

CMD ["./sim-engine"]
