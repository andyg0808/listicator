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
	git diff --quiet
	yarn build
	git tag deploy-`date --iso-8601=seconds`

.PHONY: last-deploy
last-deploy:
	git checkout `git tag --sort=-refname | head -n1`
