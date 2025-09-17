#!/bin/bash
# Vis siste auto-commit for auto-lagring

git log --grep='Auto-commit:' -1 --pretty=format:'%C(yellow)%h%Creset %Cgreen%ad%Creset %C(bold blue)%an%Creset %s' --date=iso
