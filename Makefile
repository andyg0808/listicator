.PHONY: default
default: test upload

.PHONY: test
test:
	npx cypress run

.PHONY: upload
upload: build
	aws s3 sync build s3://listicator.work/

final: build
	echo "Waiting before upload…"
	sleep 5
	aws s3 sync build s3://listicator.com/

.PHONY: build
build:
	yarn build
