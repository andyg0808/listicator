.PHONY: default
default: test upload

.PHONY: help
help:
	@sed '/^.PHONY/!d; s/^.PHONY: //' Makefile

.PHONY: test
test:
	yarn test

.PHONY: docker-build
docker-build:
	docker build -t listicator .


.PHONY: docker-serve
docker-serve:
	docker run --rm -p 127.0.0.1:3000:80 listicator

.PHONY: docker-deploy
docker-deploy:
	docker build -t listicator:deploy --target=deployer .

.PHONY: docker-upload
docker-upload:
	docker run --rm -v$(HOME)/.aws/credentials:/root/.aws/credentials listicator:deploy upload

.PHONY: docker-final
docker-final:
	docker run --rm -v$(HOME)/.aws/credentials:/root/.aws/credentials listicator:deploy final

.PHONY: upload
upload: build
	git tag work-deploy-`date --iso-8601=seconds | sed 's/\W/_/g'`
	aws s3 sync build s3://listicator.work/

.PHONY: final
final: build
	echo "Waiting before upload…"
	sleep 5
	git tag com-deploy-`date --iso-8601=seconds | sed 's/\W/_/g'`
	aws s3 sync build s3://listicator.com/

.PHONY: build
build:
	git diff --quiet
	yarn compile
	yarn build

.PHONY: last-deploy
last-deploy:
	git checkout `git tag --sort=-refname | head -n1`
