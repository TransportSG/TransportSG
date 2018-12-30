for filename in $(find .); do
    [ -e "$filename" ] || continue

    if [ -f "$filename" ] && [[ -z $(echo $filename | grep 'node_modules') ]]; then
        SEARCH=$(cat $filename | grep -e '\t')
        if [[ ! -z "$SEARCH" ]]; then
            echo "$filename"
        fi
    fi
done
