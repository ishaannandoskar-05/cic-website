#!/bin/bash

LANGUAGE="$1"
FILE="$2"

case "$LANGUAGE" in

Python)
  python3 "$FILE"
  ;;

Java)
  cd /code
  javac Main.java
  java Main
  ;;

C)
  gcc "$FILE" -O2 -o /tmp/main
  /tmp/main
  ;;

C++)
  g++ "$FILE" -std=c++17 -O2 -o /tmp/main
  /tmp/main
  ;;

*)
  echo "Unsupported language"
  exit 1
  ;;
esac