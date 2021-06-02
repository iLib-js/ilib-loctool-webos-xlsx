#!/bin/bash

echo "*** Converting multiple files ... ***"
# node loctool.js convert --plugins ilib-loctool-webos-xlsx ko-KR.xlsx sample/ko-KR.xliff --targetLocale ko-KR
#locales = "ko-KR,en-US"

#for i in $locales
#do
#node node_modules/.bin/loctool convert [params]
#done


echo "Work type: 1) xlsx to xliff 2) xliff to xlsxs: "
read type

inputDir = $0
#outputDir = $1
locales=("ko-KR" "it-IT");

for locale in "${locales[@]}";
do
	echo "$locale"
done

if [ "$type" == 1 ];then
	echo $type
else
 	echo $type
fi
