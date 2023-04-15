CURL_PATH=/Users/tommy/dev/shadow/curl-impersonate/curl

$CURL_PATH 'https://api.nftfi.com/listings' -H 'x-paging: {"limit":4000,"skip":0,"sort":null}' > nftfi_listing.json
