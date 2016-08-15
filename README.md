git archive --format=tar --output=$(cat package.json | jq .name -r )-$(cat package.json | jq .version -r ).tar --prefix=$(cat package.json | jq .name -r )-$(cat package.json | jq .version -r )/ HEAD

gzip $(cat package.json | jq .name -r )-$(cat package.json | jq .version -r ).tar

rpmbuild --define "_tmppath /tmp" --define "_sourcedir ." --define "_srcrpmdir ." --nodeps -bs $(cat package.json | jq .name -r).spec
sudo mock -r epel-7-x86_64 $(cat package.json | jq .name -r)-$(cat package.json | jq .version -r )-1.fc21.src.rpm --resultdir=mock/result


[ -d test ] || mkdir test

rm -rf  test/*

cp mock/result/*.rpm test/

( cd test && rpm2cpio *.rpm | cpio -idmv)
