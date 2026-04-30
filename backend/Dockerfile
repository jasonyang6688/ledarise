# syntax=docker/dockerfile:1.6
# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: build — compile a static Go binary
# ─────────────────────────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS build
WORKDIR /src

# Cache deps separately for faster rebuilds
COPY go.mod go.sum ./
RUN go mod download

COPY . .
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -trimpath -ldflags="-s -w" -o /out/ledarise-backend .

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: runtime — minimal Alpine with CA certs + tzdata + a non-root user
# ─────────────────────────────────────────────────────────────────────────────
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata wget && \
    adduser -D -u 10001 -h /app app
WORKDIR /app

COPY --from=build /out/ledarise-backend /app/ledarise-backend
RUN mkdir -p /app/uploads && chown -R app:app /app
USER app

ENV GIN_MODE=release \
    SERVER_PORT=8080 \
    UPLOAD_DIR=/app/uploads

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

ENTRYPOINT ["/app/ledarise-backend"]
