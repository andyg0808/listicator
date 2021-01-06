.PHONY: default
default: upload

.PHONY: upload
upload: build
	aws s3 sync build s3://listicator.work/

.PHONY: build
build:
	yarn build
