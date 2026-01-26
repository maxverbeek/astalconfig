#!/usr/bin/env bash

for f in lucide-*.svg; do
  if [[ "$f" == *"-symbolic.svg" ]]; then
    continue
  fi

  output_name="${f%.*}-symbolic.svg"

  if [ -f $output_name ]; then
    continue
  fi

  inkscape "$f" \
    --batch-process \
    --actions="select-all;selection-ungroup;object-stroke-to-path;path-union;export-plain-svg;export-filename:$output_name;export-do"
done
