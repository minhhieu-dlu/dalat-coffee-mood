IMAGE_NAME=dalat-coffee-mood:test
CONTAINER_NAME=dcm-test
PORT=3000

.PHONY: e2e
e2e: build run wait test cleanup

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d --rm --name $(CONTAINER_NAME) --env-file .env.local -p $(PORT):3000 $(IMAGE_NAME)

wait:
	./scripts/wait-for.sh http://localhost:$(PORT) 120

test:
	npx playwright install --with-deps
	npx playwright test

cleanup:
	docker kill $(CONTAINER_NAME) || true
