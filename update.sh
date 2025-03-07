#!/bin/bash

# Function to display a progress bar
progress_bar() {
    local duration=$1
    already_done() { for ((done=0; done<$elapsed; done++)); do printf "▇"; done }
    remaining() { for ((remain=$elapsed; remain<$duration; remain++)); do printf " "; done }
    percentage() { printf "| %s%%" $(( (($elapsed)*100)/($duration)*100/100 )); }
    for (( elapsed=1; elapsed<=$duration; elapsed++ )); do
        already_done; remaining; percentage
        sleep 0.1
        printf "\r"
    done
    printf "\n"
}

# Function to display retro animation
retro_animation() {
    frames=(
        "Updating... [=     ]"
        "Updating... [==    ]"
        "Updating... [===   ]"
        "Updating... [====  ]"
        "Updating... [===== ]"
        "Updating... [======]"
    )
    for frame in "${frames[@]}"; do
        echo -ne "\r$frame"
        sleep 0.2
    done
    echo -ne "\rUpdating... [======]\n"
}

# Update and upgrade system
echo -e "\e[1;34mStarting system update...\e[0m"
retro_animation
sudo apt update
progress_bar 30

echo -e "\e[1;34mUpgrading system packages...\e[0m"
retro_animation
sudo apt upgrade -y
progress_bar 30

echo -e "\e[1;34mUpdating distribution...\e[0m"
retro_animation
sudo apt dist-upgrade -y
progress_bar 30

# Display completion message
echo -e "\e[1;32mUpdate complete!\e[0m"
echo -e "\e[1;33mInstalled packages:\e[0m"
dpkg -l | grep '^ii' | awk '{print $2}' | column