# Developers Guide

## Getting the environment setup

1. Get the [latest release of Sia](TODO)
2. Download [atom-shell](https://github.com/atom/atom-shell/releases)
3. Extract atom-shell (optionally add it to your path, the `atom` executable within the directory is what you use to run atom-shell applications)
3. Clone Sia-UI `git clone https://github.com/NebulousLabs/Sia-UI.git`
4. Install Sia-UI Dependencies
```
# With ubuntu
sudo apt-get install ruby-haml node-less
```
5. Execute `/path/to/atom-shell/atom /path/to/sia-ui`

## Project Structure

This is a quick walk through the structure of the project.

At the top level of the project there are two directories...

`lib`
`site`

`lib` contains scripts used at in the atom-shell layer known as the
