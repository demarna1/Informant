for ((n=0; n<$2; n++)); do
  echo "opening"
  google-chrome "http://localhost:3000/informant?gameCode=$1&name=Noah"
done
