.PHONY: dev backend frontend install help

## Start both backend and frontend dev servers
dev:
	@trap 'kill 0' SIGINT; \
	$(MAKE) backend & \
	$(MAKE) frontend & \
	wait

## Start the .NET backend (https://localhost:7000)
backend:
	cd backend/EzraTaskManager.Api && dotnet run

## Start the Vite frontend (http://localhost:5173)
frontend:
	cd frontend && npm run dev

## Install frontend dependencies
install:
	cd frontend && npm install

## Show available commands
help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /  /'
	@echo ""
