.PHONY: build help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## install dependencies
	@if [ "$(CI)" != "true" ]; then \
		echo "Full install..."; \
		yarn; \
	fi
	@if [ "$(CI)" = "true" ]; then \
		echo "Frozen install..."; \
		yarn --frozen-lockfile; \
	fi

build-ra-auth-cognito:
	@echo "Transpiling ra-auth-cognito files...";
	@cd ./packages/ra-auth-cognito && yarn build

build-demo-react-admin:
	@echo "Transpiling demo files...";
	@cd ./packages/demo-react-admin && yarn build

build: build-ra-auth-cognito build-demo-react-admin ## compile ES6 files to JS

lint: ## lint the code and check coding conventions
	@echo "Running linter..."
	@yarn lint

prettier: ## prettify the source code using prettier
	@echo "Running prettier..."
	@yarn prettier

test: build test-unit lint ## launch all tests

test-unit: ## launch unit tests
	echo "Running unit tests...";
	yarn test-unit;

start:
	@cd ./packages/demo-react-admin && yarn start

publish: ## Publish the package
	cd packages/ra-auth-cognito && npm publish